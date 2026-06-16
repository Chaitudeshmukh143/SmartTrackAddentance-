package com.eduattend.sams.service;

import com.eduattend.sams.entity.*;
import com.eduattend.sams.enums.*;
import com.eduattend.sams.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for detecting fraudulent attendance patterns.
 */
@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final AttendanceAuditLogRepository attendanceAuditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final AttendanceService attendanceService;
    private final NotificationService notificationService;

    /**
     * Analyze attendance attempts for a student in a session and flag any fraudulent patterns.
     * This method should be called after each attendance attempt (whether successful or not).
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID
     * @param deviceHash The device hash from the attempt
     * @param ipAddress The IP address from the attempt
     * @param latitude The latitude from the attempt
     * @param longitude The longitude from the attempt
     * @param isQrExpired Whether the QR was expired
     * @param isQrReplay Whether the QR was a replay
     * @param isGpsMismatch Whether the GPS was outside the allowed radius
     */
    @Transactional
    public void analyzeFraudPatterns(UUID studentId, UUID sessionId, String deviceHash, String ipAddress, 
                                     Double latitude, Double longitude, boolean isQrExpired, boolean isQrReplay,
                                     boolean isGpsMismatch) {
        // We'll check for various patterns and create security events if detected.

        // 1. Repeated GPS violations (more than 2 GPS mismatches in the last 10 minutes for this student)
        if (isGpsMismatch && hasRepeatedGpsViolations(studentId, sessionId)) {
            securityEventRepository.save(new SecurityEvent(
                    null, // id will be generated
                    studentId,
                    SecurityEventType.GPS_MISMATCH.name(),
                    "HIGH",
                    "Student has repeatedly attempted attendance from outside the allowed radius. " +
                            "Last attempt at lat: " + latitude + ", lon: " + longitude
            ));
            // Send a notification to the student (and possibly the teacher) about the GPS violation
            sendFraudNotification(studentId, "GPS Violation", "You have been repeatedly detected outside the attendance zone.");
        }

        // 2. Repeated device changes (more than 2 different devices used in the last 20 minutes for this student)
        if (hasRepeatedDeviceChanges(studentId, sessionId)) {
            securityEventRepository.save(new SecurityEvent(
                    null,
                    studentId,
                    SecurityEventType.MULTIPLE_DEVICE_USAGE.name(),
                    "HIGH",
                    "Student has used multiple devices to attempt attendance in a short period."
            ));
            sendFraudNotification(studentId, "Multiple Device Usage", "You have been flagged for using multiple devices to mark attendance.");
        }

        // 3. Attendance abuse patterns (e.g., marking attendance and then having others use the same QR)
        // This is more complex and might require looking at patterns across multiple sessions.
        // For simplicity, we'll check for QR replays and mark them as fraud.

        // 4. Multiple failed scans (more than 5 failed scans in the last 15 minutes)
        if (hasMultipleFailedScans(studentId, sessionId)) {
            securityEventRepository.save(new SecurityEvent(
                    null,
                    studentId,
                    SecurityEventType.SUSPICIOUS_ACTIVITY.name(),
                    "MEDIUM",
                    "Student has had multiple failed attendance scan attempts in a short period."
            ));
            sendFraudNotification(studentId, "Multiple Failed Scans", "You have had multiple failed scan attempts. Please ensure you are scanning the correct QR code.");
        }
    }

    /**
     * Check if the student has repeatedly violated GPS (more than 2 times in the last 10 minutes).
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID (to focus on the current session)
     * @return true if there are repeated GPS violations, false otherwise
     */
    private boolean hasRepeatedGpsViolations(UUID studentId, UUID sessionId) {
        Instant tenMinutesAgo = Instant.now().minusSeconds(600);
        List<AttendanceAuditLog> logs = attendanceAuditLogRepository.findByStudentIdAndCreatedAtAfterOrderByCreatedAtDesc(
                studentId, tenMinutesAgo);
        long gpsMismatchCount = logs.stream()
                .filter(log -> sessionId.equals(log.getAttendance().getSession().getId()) &&
                        "SCAN_ATTEMPT".equals(log.getAction()) &&
                        log.getRiskScore() >= 40) // Assuming risk score >=40 indicates GPS mismatch (since GPS mismatch is +40)
                .count();
        return gpsMismatchCount > 2;
    }

    /**
     * Check if the student has used multiple devices (more than 2 distinct device hashes) in the last 20 minutes.
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID
     * @return true if there are repeated device changes, false otherwise
     */
    private boolean hasRepeatedDeviceChanges(UUID studentId, UUID sessionId) {
        Instant twentyMinutesAgo = Instant.now().minusSeconds(1200);
        List<AttendanceAuditLog> logs = attendanceAuditLogRepository.findByStudentIdAndCreatedAtAfterOrderByCreatedAtDesc(
                studentId, twentyMinutesAgo);
        // We'll count distinct device hashes for scan attempts in the current session
        return logs.stream()
                .filter(log -> sessionId.equals(log.getAttendance().getSession().getId()) &&
                        "SCAN_ATTEMPT".equals(log.getAction()) &&
                        log.getDeviceHash() != null && !log.getDeviceHash().isEmpty())
                .map(AttendanceAuditLog::getDeviceHash)
                .distinct()
                .count() > 2;
    }

    /**
     * Check if the student has had multiple failed scans (more than 5) in the last 15 minutes.
     * We consider a failed scan as an attempt that did not result in an attendance record (or was rejected).
     * In our audit log, we log every scan attempt (whether successful or not) with action "SCAN_ATTEMPT".
     * We can then check if the attempt was unsuccessful by looking at the risk score or by checking if there is no subsequent attendance record.
     * For simplicity, we'll consider any scan attempt with a risk score above a threshold as failed, or we can check if the attempt did not lead to an attendance record.
     * However, we don't have a direct link from the audit log to the attendance record in the log entity (we set attendance to null for attempt logs).
     * We'll change our approach: we'll consider a scan attempt as failed if it was rejected by the system (e.g., due to GPS mismatch, expired QR, etc.).
     * We can infer that from the risk score: if the risk score is above a certain threshold (say 30) then it's likely a failed attempt due to security reasons.
     * Alternatively, we can look for specific actions in the audit log that indicate failure, but we only have "SCAN_ATTEMPT" for now.
     * Let's change the audit log to also record the result? Or we can use the risk score: if the risk score is high, it's likely a failed attempt.
     * We'll say: if the risk score is >= 30, then it's a failed attempt due to security reasons.
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID
     * @return true if there are multiple failed scans, false otherwise
     */
    private boolean hasMultipleFailedScans(UUID studentId, UUID sessionId) {
        Instant fifteenMinutesAgo = Instant.now().minusSeconds(900);
        List<AttendanceAuditLog> logs = attendanceAuditLogRepository.findByStudentIdAndCreatedAtAfterOrderByCreatedAtDesc(
                studentId, fifteenMinutesAgo);
        long failedScanCount = logs.stream()
                .filter(log -> sessionId.equals(log.getAttendance().getSession().getId()) &&
                        "SCAN_ATTEMPT".equals(log.getAction()) &&
                        log.getRiskScore() >= 30) // Consider as failed if risk score is 30 or above
                .count();
        return failedScanCount > 5;
    }

    /**
     * Send a notification to the student about a fraud detection event.
     * 
     * @param studentId The student's ID
     * @param title The notification title
     * @param message The notification message
     */
    private void sendFraudNotification(UUID studentId, String title, String message) {
        // We'll use the notification service to create a notification for the student.
        // We'll set the type to SECURITY and priority to HIGH.
        notificationService.createNotification(
                studentId,
                NotificationType.SECURITY,
                title,
                message,
                NotificationPriority.HIGH,
                null, // actionUrl
                null  // createdBy (we can set it to the system, but we don't have a system user ID. We'll leave it null for now.)
        );
    }
}