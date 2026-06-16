package com.eduattend.sams.service;

import com.eduattend.sams.entity.LeaveRequest;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.LeaveType;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.LeaveRequestRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public LeaveRequest applyLeave(UUID studentId, LeaveRequest leaveRequest) {
        // Verify the student exists and is a student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));
        if (!student.getRole().name().equals("STUDENT")) {
            throw new BadRequestException("Only students can apply for leave");
        }

        // Validate dates
        if (leaveRequest.getFromDate().isAfter(leaveRequest.getToDate())) {
            throw new BadRequestException("From date cannot be after to date");
        }
        if (leaveRequest.getFromDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave cannot be applied for past dates");
        }

        // Set the request properties
        leaveRequest.setStudent(student);
        leaveRequest.setId(UUID.randomUUID());
        leaveRequest.setStatus(RequestStatus.PENDING);

        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public void cancelLeave(UUID leaveId, UUID studentId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new BadRequestException("Leave request not found"));

        // Verify that the leave request belongs to the student
        if (!leaveRequest.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }

        // Only pending leaves can be cancelled
        if (leaveRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be cancelled");
        }

        leaveRequestRepository.delete(leaveRequest);
    }

    public List<LeaveRequest> getLeaveHistoryForStudent(UUID studentId) {
        return leaveRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public LeaveRequest approveLeave(UUID leaveId, UUID teacherId) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can approve leave requests");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new BadRequestException("Leave request not found"));

        if (leaveRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be approved");
        }

        // Update request status
        leaveRequest.setStatus(RequestStatus.APPROVED);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public LeaveRequest rejectLeave(UUID leaveId, UUID teacherId) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can reject leave requests");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new BadRequestException("Leave request not found"));

        if (leaveRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be rejected");
        }

        // Update request status
        leaveRequest.setStatus(RequestStatus.REJECTED);
        return leaveRequestRepository.save(leaveRequest);
    }

    // For teacher analytics, we can provide some basic counts
    public long getPendingLeaveCount() {
        return leaveRequestRepository.countByStatus(RequestStatus.PENDING);
    }

    public long getApprovedLeaveCount() {
        return leaveRequestRepository.countByStatus(RequestStatus.APPROVED);
    }

    public long getRejectedLeaveCount() {
        return leaveRequestRepository.countByStatus(RequestStatus.REJECTED);
    }

    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(RequestStatus.PENDING);
    }

    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(RequestStatus.PENDING);
    }
}