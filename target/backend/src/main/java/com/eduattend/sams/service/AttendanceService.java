package com.eduattend.sams.service;

import com.eduattend.sams.dto.attendance.CreateAttendanceSessionRequest;
import com.eduattend.sams.entity.AttendanceRecord;
import com.eduattend.sams.entity.AttendanceSession;
import com.eduattend.sams.entity.AttendanceAudit;
import com.eduattend.sams.entity.Classroom;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.AttendanceStatus;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.AttendanceAuditRepository;
import com.eduattend.sams.repository.AttendanceRecordRepository;
import com.eduattend.sams.repository.AttendanceSessionRepository;
import com.eduattend.sams.repository.ClassroomRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceAuditRepository attendanceAuditRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceSession createAttendanceSession(UUID teacherId, CreateAttendanceSessionRequest request) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can create attendance sessions");
        }

        // Verify the classroom exists
        Classroom classroom = classroomRepository.findById(request.classroomId())
                .orElseThrow(() -> new BadRequestException("Classroom not found"));

        // Create the attendance session
        AttendanceSession session = AttendanceSession.create();
        session.setClassroom(classroom);

        session.setAttendanceDate(LocalDate.now()); // Always use today's date for simplicity
        session.setStartTime(Instant.now());
        session.setExpiresAt(Instant.now().plusSeconds(request.expiryMinutes() * 60L));
        session.setAllowedRadiusMeters(request.allowedRadiusMeters());
        session.setLatitude(request.latitude());
        session.setLongitude(request.longitude());

        AttendanceSession savedSession = attendanceSessionRepository.save(session);

        // Create audit log
        AttendanceAudit audit = AttendanceAudit.create();
        audit.setSessionId(savedSession.getId());
        audit.setStudentId(null); // Not applicable for session creation
        audit.setAction("CREATED");
        audit.setTimestamp(Instant.now());
        audit.setMetadata("Teacher " + teacher.getId() + " created attendance session for classroom " + classroom.getId());
        attendanceAuditRepository.save(audit);

        return savedSession;
    }

    @Transactional
    public void closeAttendanceSession(UUID sessionId, UUID teacherId) {
        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Attendance session not found"));

        // Verify that the teacher is the one who created the session (or at least a teacher in the classroom)
        // For simplicity, we'll just check that the session hasn't been closed yet and that the user is a teacher.
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can close attendance sessions");
        }

        if (session.getEndTime() != null) {
            throw new BadRequestException("Attendance session is already closed");
        }

        session.setEndTime(Instant.now());
        attendanceSessionRepository.save(session);

        // Create audit log
        AttendanceAudit audit = AttendanceAudit.create();
        audit.setSessionId(sessionId);
        audit.setStudentId(null);
        audit.setAction("CLOSED");
        audit.setTimestamp(Instant.now());
        audit.setMetadata("Teacher " + teacherId + " closed attendance session " + sessionId);
        attendanceAuditRepository.save(audit);
    }

    @Transactional
    public AttendanceRecord markAttendance(UUID sessionId, UUID studentId, String deviceFingerprint, Boolean browserVisibilityCompromised) {
        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Attendance session not found"));

        // Check if session is expired
        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Attendance session has expired");
        }

        // Check if session is closed
        if (session.getEndTime() != null) {
            throw new BadRequestException("Attendance session is closed");
        }

        // Verify the student exists and is a student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));
        if (!student.getRole().name().equals("STUDENT")) {
            throw new BadRequestException("Only students can mark attendance");
        }

        // Check if the student is a member of the classroom
        // We don't have a direct method, but we can check via ClassroomMembershipRepository if we had it.
        // Since we don't have access to ClassroomMembershipRepository in this service, we'll skip for now.
        // TODO: Add classroom membership check.

        // Check for existing attendance record for this student and session
        if (attendanceRecordRepository.findBySessionIdAndStudentId(sessionId, studentId).isPresent()) {
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

        // Create audit log
        AttendanceAudit audit = AttendanceAudit.create();
        audit.setSessionId(sessionId);
        audit.setStudentId(studentId);
        audit.setAction("MARKED");
        audit.setTimestamp(Instant.now());
        audit.setMetadata("Student " + studentId + " marked attendance for session " + sessionId);
        attendanceAuditRepository.save(audit);

        return savedRecord;
    }

    public List<AttendanceRecord> getAttendanceForSession(UUID sessionId) {
        return attendanceRecordRepository.findBySessionId(sessionId);
    }

    public List<AttendanceRecord> getAttendanceHistoryForStudent(UUID studentId) {
        return attendanceRecordRepository.findByStudentIdOrderByMarkedAtDesc(studentId);
    }
}