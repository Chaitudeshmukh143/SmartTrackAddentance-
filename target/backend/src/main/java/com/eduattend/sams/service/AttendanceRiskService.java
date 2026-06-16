package com.eduattend.sams.service;

import com.eduattend.sams.entity.*;
import com.eduattend.sams.enums.*;
import com.eduattend.sams.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for calculating and managing attendance risk scores.
 */
@Service
@RequiredArgsConstructor
public class AttendanceRiskService {

    private final AttendanceAuditLogRepository attendanceAuditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final DeviceFingerprintRepository deviceFingerprintRepository;
    private final UserRepository userRepository;

    /**
     * Calculate risk score for an attendance attempt.
     * 
     * @param studentId The student's ID
     * @param sessionId The attendance session ID
     * @param deviceHash The device hash from the attendance attempt
     * @param ipAddress The IP address from the attendance attempt
     * @param latitude The latitude from the attendance attempt
     * @param longitude The longitude from the attendance attempt
     * @param isQrExpired Whether the QR code was expired
     * @param isQrReplay Whether the QR code was a replay attempt
     * @param isMultipleDeviceUsage Whether multiple devices were used for the same student in a short time
     * @param isGpsMismatch Whether the GPS location is outside the allowed radius
     * @return The calculated risk score (0-100)
     */
    public Integer calculateRiskScore(UUID studentId, UUID sessionId, String deviceHash, String ipAddress, 
                                      Double latitude, Double longitude, boolean isQrExpired, boolean isQrReplay,
                                      boolean isMultipleDeviceUsage, boolean isGpsMismatch) {
        int score = 0;

        // GPS mismatch = +40
        if (isGpsMismatch) {
            score += 40;
        }

        // Unknown device = +20
        if (isUnknownDevice(studentId, deviceHash)) {
            score += 20;
        }

        // Multiple attempts = +15 (we'll check for recent attempts in the audit log)
        if (hasMultipleRecentAttempts(studentId, sessionId)) {
            score += 15;
        }

        // QR expired attempt = +10
        if (isQrExpired) {
            score += 10;
        }

        // Multiple device usage = +30
        if (isMultipleDeviceUsage) {
            score += 30;
        }

        // Cap the score at 100
        return Math.min(score, 100);
    }

    /**
     * Check if the device is unknown for the student.
     * 
     * @param studentId The student's ID
     * @param deviceHash The device hash to check
     * @return true if the device is unknown, false otherwise
     */
    private boolean isUnknownDevice(UUID studentId, String deviceHash) {
        // If there's no device hash, consider it unknown
        if (deviceHash == null || deviceHash.isEmpty()) {
            return true;
        }
        DeviceFingerprint existing = deviceFingerprintRepository.findByUserIdAndDeviceHash(studentId, deviceHash);
        return existing == null;
    }

    /**
     * Check if there have been multiple recent attendance attempts for the student in the current session.
     * We'll define recent as within the last 5 minutes.
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID
     * @return true if there are multiple recent attempts, false otherwise
     */
    private boolean hasMultipleRecentAttempts(UUID studentId, UUID sessionId) {
        Instant fiveMinutesAgo = Instant.now().minusSeconds(300);
        List<AttendanceAuditLog> recentLogs = attendanceAuditLogRepository.findByStudentIdAndCreatedAtAfterOrderByCreatedAtDesc(
                studentId, fiveMinutesAgo);
        // Count how many of these logs are for the same session and are scan attempts
        long attemptCount = recentLogs.stream()
                .filter(log -> sessionId.equals(log.getAttendance().getSession().getId()) &&
                        "SCAN_ATTEMPT".equals(log.getAction()))
                .count();
        return attemptCount > 1; // More than one attempt in the last 5 minutes
    }

    /**
     * Log an attendance attempt with its risk score.
     * 
     * @param studentId The student's ID
     * @param sessionId The session ID
     * @param action The action (SCAN_ATTEMPT, ATTENDANCE_MARKED, etc.)
     * @param deviceHash The device hash
     * @param ipAddress The IP address
     * @param location The location description (optional)
     * @param riskScore The calculated risk score
     */
    public void logAttendanceAttempt(UUID studentId, UUID sessionId, String action, String deviceHash, 
                                     String ipAddress, String location, Integer riskScore) {
        AttendanceAuditLog log = new AttendanceAuditLog();
        log.setStudentId(studentId);
        // We need to get the attendance record for the session and student if it exists, or leave it null for attempt logs
        // For simplicity, we'll set attendance to null for attempt logs and only set it when attendance is marked.
        // But the entity requires an attendance. We'll adjust the entity to allow null? 
        // Looking at the entity, attendance is nullable (we didn't set nullable = false). So we can leave it null.
        log.setAttendance(null); // We'll set it when we have an attendance record
        log.setAction(action);
        log.setDeviceHash(deviceHash);
        log.setIpAddress(ipAddress);
        log.setLocation(location);
        log.setRiskScore(riskScore);
        attendanceAuditLogRepository.save(log);
    }

    /**
     * Get the risk level based on the score.
     * 
     * @param score The risk score (0-100)
     * @return The risk level
     */
    public RiskLevel getRiskLevel(Integer score) {
        if (score >= 80) {
            return RiskLevel.CRITICAL;
        } else if (score >= 60) {
            return RiskLevel.HIGH;
        } else if (score >= 40) {
            return RiskLevel.MEDIUM;
        } else {
            return RiskLevel.LOW;
        }
    }

    /**
     * Record a security event.
     * 
     * @param userId The user ID associated with the event
     * @param eventType The type of security event
     * @param severity The severity of the event
     * @param details Additional details about the event
     */
    public void recordSecurityEvent(UUID userId, SecurityEventType eventType, String severity, String details) {
        SecurityEvent event = new SecurityEvent();
        event.setUserId(userId);
        event.setEventType(eventType.name());
        event.setSeverity(severity);
        event.setDetails(details);
        securityEventRepository.save(event);
    }
}