package com.eduattend.sams.service;

import com.eduattend.sams.entity.AttendanceRecord;
import com.eduattend.sams.entity.AttendanceRegularizationRequest;
import com.eduattend.sams.entity.AttendanceSession;
import com.eduattend.sams.entity.Classroom;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.AttendanceStatus;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.AttendanceRegularizationRequestRepository;
import com.eduattend.sams.repository.AttendanceRecordRepository;
import com.eduattend.sams.repository.AttendanceSessionRepository;
import com.eduattend.sams.repository.ClassroomMembershipRepository;
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
public class AttendanceRegularizationRequestService {

    private final AttendanceRegularizationRequestRepository requestRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final ClassroomMembershipRepository classroomMembershipRepository;

    @Transactional
    public AttendanceRegularizationRequest createRequest(UUID studentId, AttendanceRegularizationRequest request) {
        // Verify the student exists and is a student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));
        if (!student.getRole().name().equals("STUDENT")) {
            throw new BadRequestException("Only students can create regularization requests");
        }

        // Verify the classroom exists
        Classroom classroom = classroomRepository.findById(request.getClassroom().getId())
                .orElseThrow(() -> new BadRequestException("Classroom not found"));

        // Check if the student is a member of the classroom
        boolean isMember = classroomMembershipRepository.existsByClassroomIdAndStudentId(
                classroom.getId(), studentId);
        if (!isMember) {
            throw new BadRequestException("Student is not a member of the classroom");
        }

        // Set the request properties
        request.setStudent(student);
        request.setClassroom(classroom);
        request.setStatus(RequestStatus.PENDING);
        request.setId(UUID.randomUUID());

        return requestRepository.save(request);
    }

    public List<AttendanceRegularizationRequest> getRequestsByStudent(UUID studentId) {
        return requestRepository.findByStudentId(studentId);
    }

    public List<AttendanceRegularizationRequest> getPendingRequests() {
        return requestRepository.findByStatus(RequestStatus.PENDING);
    }

    @Transactional
    public AttendanceRegularizationRequest approveRequest(UUID requestId, UUID teacherId) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can approve regularization requests");
        }

        AttendanceRegularizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Regularization request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be approved");
        }

        // Update request status
        request.setStatus(RequestStatus.APPROVED);
        AttendanceRegularizationRequest savedRequest = requestRepository.save(request);

        // Create attendance record for the student on the given date
        // We need to find or create an attendance session for the classroom and date
        AttendanceSession session = attendanceSessionRepository.findByClassroomIdAndAttendanceDate(
                request.getClassroom().getId(), request.getAttendanceDate())
                .orElseGet(() -> {
                    // Create a new session for the whole day (simplified)
                    AttendanceSession newSession = AttendanceSession.create();
                    newSession.setClassroom(request.getClassroom());
                    newSession.setAttendanceDate(request.getAttendanceDate());
                    newSession.setStartTime(Instant.now().truncateTo(java.time.temporal.ChronoUnit.DAYS)); // Start of day
                    newSession.setEndTime(Instant.now().plusSeconds(24 * 60 * 60 - 1).truncateTo(java.time.temporal.ChronoUnit.SECONDS)); // End of day
                    newSession.setExpiresAt(newSession.getEndTime()); // Expire at end of day
                    newSession.setAllowedRadiusMeters(0); // Not applicable for regularization
                    newSession.setLatitude(0.0);
                    newSession.setLongitude(0.0);
                    return attendanceSessionRepository.save(newSession);
                });

        // Check if there's already an attendance record for this student and session (or for this student and date in any session?)
        // We'll check for any attendance record for this student on this date (regardless of session) to avoid duplicates.
        // But note: a student can have multiple sessions in a day (different classes). We are regularizing for a specific classroom and date.
        // So we should check if there's already an attendance record for this student in any session of this classroom on this date?
        // Actually, the regularization request is for a specific classroom and date. We are creating a session for that classroom and date.
        // We'll check if there's already an attendance record for this student in the session we just found/created.
        if (attendanceRecordRepository.findBySessionIdAndStudentId(session.getId(), request.getStudent().getId()).isPresent()) {
            // If there's already a record, we don't create a duplicate.
            // But we might want to update the status? However, the existing record might be for a different session.
            // For simplicity, we'll just not create a duplicate.
            return savedRequest;
        }

        // Create attendance record
        AttendanceRecord record = AttendanceRecord.create();
        record.setSession(session);
        record.setStudent(request.getStudent());
        record.setAttendanceDate(request.getAttendanceDate());
        record.setMarkedAt(Instant.now());
        record.setStatus(AttendanceStatus.PRESENT);
        // For regularization, we don't have device fingerprint or browser visibility compromised, so we'll set default values.
        record.setDeviceFingerprint("REGULARIZATION");
        record.setBrowserVisibilityCompromised(false);

        attendanceRecordRepository.save(record);

        return savedRequest;
    }

    @Transactional
    public AttendanceRegularizationRequest rejectRequest(UUID requestId, UUID teacherId) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can reject regularization requests");
        }

        AttendanceRegularizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Regularization request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        // Update request status
        request.setStatus(RequestStatus.REJECTED);
        return requestRepository.save(request);
    }
}