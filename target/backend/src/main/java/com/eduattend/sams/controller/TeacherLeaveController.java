package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.teacherleave.TeacherLeaveRequestDto;
import com.eduattend.sams.entity.TeacherLeaveRequest;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.service.TeacherLeaveRequestService;
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
@RequestMapping("/api/v1/teacher-leave")
public class TeacherLeaveController {

    private final TeacherLeaveRequestService teacherLeaveRequestService;
    private final AuthService authService;

    public TeacherLeaveController(TeacherLeaveRequestService teacherLeaveRequestService, AuthService authService) {
        this.teacherLeaveRequestService = teacherLeaveRequestService;
        this.authService = authService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Object>> applyLeave(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TeacherLeaveRequestDto leaveRequestDto) {
        UUID teacherId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Teacher not found")).getId();
        
        // Convert DTO to entity
        TeacherLeaveRequest leaveRequest = new TeacherLeaveRequest();
        leaveRequest.setFromDate(leaveRequestDto.getFromDate());
        leaveRequest.setToDate(leaveRequestDto.getToDate());
        leaveRequest.setReason(leaveRequestDto.getReason());
        
        TeacherLeaveRequest createdLeave = teacherLeaveRequestService.applyLeave(teacherId, leaveRequest);
        return ResponseEntity.ok(ApiResponse.success("Teacher leave request applied", createdLeave));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<Object>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID teacherId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Teacher not found")).getId();
        List<TeacherLeaveRequest> requests = teacherLeaveRequestService.getLeaveRequestsByTeacher(teacherId);
        
        // Convert entities to DTOs for response (simplified - in a real app we'd use MapStruct)
        List<Object> requestDtos = requests.stream().map(req -> {
            // Simplified conversion - in practice use MapStruct
            return new TeacherLeaveRequestDto(
                req.getId(),
                req.getTeacher().getId(),
                req.getFromDate(),
                req.getToDate(),
                req.getReason(),
                req.getStatus()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Teacher leave requests retrieved", requestDtos));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Object>>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Only teachers/admins can see pending requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can view pending teacher leave requests");
        }
        
        // Note: We need to add a method to the service to get all pending requests
        // For now, we'll return an empty list and then fix the service
        return ResponseEntity.ok(ApiResponse.success("Pending teacher leave requests retrieved", java.util.Collections.emptyList()));
    }

    @PutMapping("/approve/{requestId}")
    public ResponseEntity<ApiResponse<Object>> approveRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID requestId) {
        // Only teachers/admins can approve requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can approve teacher leave requests");
        }
        
        TeacherLeaveRequest approvedRequest = teacherLeaveRequestService.approveRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Teacher leave request approved", approvedRequest));
    }

    @PutMapping("/reject/{requestId}")
    public ResponseEntity<ApiResponse<Object>> rejectRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID requestId) {
        // Only teachers/admins can reject requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can reject teacher leave requests");
        }
        
        TeacherLeaveRequest rejectedRequest = teacherLeaveRequestService.rejectRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Teacher leave request rejected", rejectedRequest));
    }
}