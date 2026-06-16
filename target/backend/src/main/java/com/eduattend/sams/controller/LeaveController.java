package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.leave.LeaveRequestDto;
import com.eduattend.sams.entity.LeaveRequest;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.service.LeaveRequestService;
import com.eduattend.sams.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/leave")
public class LeaveController {

    private final LeaveRequestService leaveRequestService;
    private final AuthService authService;

    public LeaveController(LeaveRequestService leaveRequestService, AuthService authService) {
        this.leaveRequestService = leaveRequestService;
        this.authService = authService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Object>> applyLeave(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LeaveRequestDto leaveRequestDto) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        
        // Convert DTO to entity
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setFromDate(leaveRequestDto.getFromDate());
        leaveRequest.setToDate(leaveRequestDto.getToDate());
        leaveRequest.setLeaveType(leaveRequestDto.getLeaveType());
        leaveRequest.setReason(leaveRequestDto.getReason());
        leaveRequest.setAttachmentUrl(leaveRequestDto.getAttachmentUrl());
        
        LeaveRequest createdLeave = leaveRequestService.applyLeave(studentId, leaveRequest);
        return ResponseEntity.ok(ApiResponse.success("Leave request applied", createdLeave));
    }

    @DeleteMapping("/cancel/{leaveId}")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID leaveId) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        leaveRequestService.cancelLeave(leaveId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", null));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Object>>> getLeaveHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        List<LeaveRequest> leaves = leaveRequestService.getLeaveHistoryForStudent(studentId);
        
        // Convert entities to DTOs for response (simplified - in a real app we'd use MapStruct)
        List<Object> leaveDtos = leaves.stream().map(leave -> {
            // Simplified conversion - in practice use MapStruct
            return new LeaveRequestDto(
                leave.getId(),
                leave.getStudent().getId(),
                leave.getClassroom() != null ? leave.getClassroom().getId() : null,
                leave.getFromDate(),
                leave.getToDate(),
                leave.getLeaveType(),
                leave.getReason(),
                leave.getAttachmentUrl(),
                leave.getStatus()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Leave history retrieved", leaveDtos));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Object>>> getPendingLeaves(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Only teachers/admins can see pending leaves
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can view pending leave requests");
        }
        
        List<LeaveRequest> pendingLeaves = leaveRequestService.getPendingLeaveRequests();
        
        // Convert entities to DTOs for response (simplified - in a real app we'd use MapStruct)
        List<Object> leaveDtos = pendingLeaves.stream().map(leave -> {
            // Simplified conversion - in practice use MapStruct
            return new LeaveRequestDto(
                leave.getId(),
                leave.getStudent().getId(),
                leave.getClassroom() != null ? leave.getClassroom().getId() : null,
                leave.getFromDate(),
                leave.getToDate(),
                leave.getLeaveType(),
                leave.getReason(),
                leave.getAttachmentUrl(),
                leave.getStatus()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Pending leave requests retrieved", leaveDtos));
    }

    @PutMapping("/approve/{leaveId}")
    public ResponseEntity<ApiResponse<Object>> approveLeave(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID leaveId) {
        // Only teachers/admins can approve leaves
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can approve leave requests");
        }
        
        LeaveRequest approvedLeave = leaveRequestService.approveLeave(leaveId, userId);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved", approvedLeave));
    }

    @PutMapping("/reject/{leaveId}")
    public ResponseEntity<ApiResponse<Object>> rejectLeave(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID leaveId) {
        // Only teachers/admins can reject leaves
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can reject leave requests");
        }
        
        LeaveRequest rejectedLeave = leaveRequestService.rejectLeave(leaveId, userId);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", rejectedLeave));
    }
}