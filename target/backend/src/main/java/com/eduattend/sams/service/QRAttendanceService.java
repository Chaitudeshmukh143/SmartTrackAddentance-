package com.eduattend.sams.service;

import com.eduattend.sams.entity.AttendanceRecord;
import com.eduattend.sams.entity.AttendanceSession;
import com.eduattend.sams.entity.Classroom;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.AttendanceStatus;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.AttendanceRecordRepository;
import com.eduattend.sams.repository.AttendanceSessionRepository;
import com.eduattend.sams.repository.ClassroomMembershipRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRAttendanceService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassroomMembershipRepository classroomMembershipRepository;
    private final UserRepository userRepository;

    /**
     * Get the QR token for an attendance session.
     * In this implementation, the QR token is the session ID itself.
     */
    public String getQrToken(UUID sessionId) {
        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Attendance session not found"));
        return session.getId().toString();
    }

    /**
     * Validate a QR token and return the associated session if valid.
     * Checks: session exists, not expired, not closed.
     */
    @Transactional(readOnly = true)
    public AttendanceSession validateQrToken(String token) {
        UUID sessionId = UUID.fromString(token);
        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Invalid QR token"));

        // Check if session has expired
        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("QR token has expired");
        }

        // Check if session is closed
        if (session.getEndTime() != null) {
            throw new BadRequestException("QR token is from a closed session");
        }

        return session;
    }

    /**
     * Process an attendance scan using a QR token.
     * Validates the token, checks student membership in the classroom,
     * and records attendance if valid.
     */
    @Transactional
    public AttendanceRecord scanAndMarkAttendance(String qrToken, UUID studentId, String deviceFingerprint, Boolean browserVisibilityCompromised) {
        // Validate the QR token and get the session
        AttendanceSession session = validateQrToken(qrToken);

        // Verify the student exists and is a student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));
        if (!student.getRole().name().equals("STUDENT")) {
            throw new BadRequestException("Only students can mark attendance via QR scan");
        }

        // Check if the student is a member of the classroom
        boolean isMember = classroomMembershipRepository.existsByClassroomIdAndStudentId(
                session.getClassroom().getId(), studentId);
        if (!isMember) {
            throw new BadRequestException("Student is not a member of the classroom for this session");
        }

        // Check for existing attendance record for this student and session
        if (attendanceRecordRepository.findBySessionIdAndStudentId(session.getId(), studentId).isPresent()) {
            throw new BadRequestException("Attendance already marked for this student in this session");
        }

        // Create attendance record
        AttendanceRecord record = AttendanceRecord.create();
        record.setSession(session);
        record.setStudent(student);
        record.setAttendanceDate(session.getAttendanceDate());
        record.setMarkedAt(Instant.now());
        record.setStatus(AttendanceStatus.PRESENT);
        record.setDeviceFingerprint(deviceFingerprint);
        record.setBrowserVisibilityCompromised(browserVisibilityCompromised);

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        return savedRecord;
    }
}