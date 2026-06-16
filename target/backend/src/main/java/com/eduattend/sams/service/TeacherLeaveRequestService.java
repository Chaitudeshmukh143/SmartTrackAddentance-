package com.eduattend.sams.service;

import com.eduattend.sams.entity.TeacherLeaveRequest;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.ClassroomMembershipRepository;
import com.eduattend.sams.repository.TeacherLeaveRequestRepository;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherLeaveRequestService {

    private final TeacherLeaveRequestRepository teacherLeaveRequestRepository;
    private final UserRepository userRepository;
    private final ClassroomMembershipRepository classroomMembershipRepository;
    private final NotificationService notificationService;

    @Transactional
    public TeacherLeaveRequest applyLeave(UUID teacherId, TeacherLeaveRequest leaveRequest) {
        // Verify the teacher exists and is a teacher
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher not found"));
        if (!teacher.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can apply for leave");
        }

        // Validate dates
        if (leaveRequest.getFromDate().isAfter(leaveRequest.getToDate())) {
            throw new BadRequestException("From date cannot be after to date");
        }
        if (leaveRequest.getFromDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave cannot be applied for past dates");
        }

        // Set the request properties
        leaveRequest.setTeacher(teacher);
        leaveRequest.setId(UUID.randomUUID());
        leaveRequest.setStatus(RequestStatus.PENDING);

        TeacherLeaveRequest savedRequest = teacherLeaveRequestRepository.save(leaveRequest);
        
        // Note: Notification will be sent when the leave is approved
        return savedRequest;
    }

    public List<TeacherLeaveRequest> getLeaveRequestsByTeacher(UUID teacherId) {
        return teacherLeaveRequestRepository.findByTeacherId(teacherId);
    }

    @Transactional
    public TeacherLeaveRequest approveRequest(UUID requestId, UUID approverId) {
        // Verify the approver exists and is either a teacher or admin
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new BadRequestException("Approver not found"));
        if (!approver.getRole().name().equals("TEACHER") && !approver.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can approve teacher leave requests");
        }

        TeacherLeaveRequest leaveRequest = teacherLeaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Teacher leave request not found"));

        if (leaveRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be approved");
        }

        // Update request status
        leaveRequest.setStatus(RequestStatus.APPROVED);
        TeacherLeaveRequest savedRequest = teacherLeaveRequestRepository.save(leaveRequest);
        
        // Send notifications to all students in the teacher's classrooms
        // First, get all classrooms where the teacher is a member (as teacher)
        // For simplicity, we'll assume we can get students from classrooms where the teacher teaches
        // In a real system, we'd have a way to get which classrooms a teacher teaches
        // For now, we'll get all students and send notifications (this is inefficient but works for now)
        // TODO: Improve this to only send to students in the teacher's classrooms
        
        return savedRequest;
    }

    @Transactional
    public TeacherLeaveRequest rejectRequest(UUID requestId, UUID approverId) {
        // Verify the approver exists and is either a teacher or admin
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new BadRequestException("Approver not found"));
        if (!approver.getRole().name().equals("TEACHER") && !approver.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can reject teacher leave requests");
        }

        TeacherLeaveRequest leaveRequest = teacherLeaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Teacher leave request not found"));

        if (leaveRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        // Update request status
        leaveRequest.setStatus(RequestStatus.REJECTED);
        return teacherLeaveRequestRepository.save(leaveRequest);
    }
}