package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.attendance.AttendanceRegularizationRequestDto;
 com.eduattend.sams.entity.AttendanceRegularizationRequest;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.RequestStatus;
import com.eduattend.sams.service.AttendanceRegularizationRequestService;
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
@RequestMapping("/api/v1/attendance-regularization")
public class AttendanceRegularizationController {

    private final AttendanceRegularizationRequestService regularizationService;
    private final AuthService authService;

    public AttendanceRegularizationController(AttendanceRegularizationRequestService regularizationService, AuthService authService) {
        this.regularizationService = regularizationService;
        this.authService = authService;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Object>> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AttendanceRegularizationRequestDto requestDto) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        
        // Convert DTO to entity
        AttendanceRegularizationRequest request = new AttendanceRegularizationRequest();
        request.setAttendanceDate(requestDto.getAttendanceDate());
        request.setReason(requestDto.getReason());
        request.setSubjectName(requestDto.getSubjectName());
        request.setAttachmentUrl(requestDto.getAttachmentUrl());
        
        AttendanceRegularizationRequest createdRequest = regularizationService.createRequest(studentId, request);
        return ResponseEntity.ok(ApiResponse.success("Regularization request created", createdRequest));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<Object>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        List<AttendanceRegularizationRequest> requests = regularizationService.getRequestsByStudent(studentId);
        
        // Convert entities to DTOs for response (simplified - in a real app we'd use MapStruct)
        List<Object> requestDtos = requests.stream().map(req -> {
            // Simplified conversion - in practice use MapStruct
            return new AttendanceRegularizationRequestDto(
                req.getId(),
                req.getStudent().getId(),
                req.getClassroom().getId(),
                req.getAttendanceDate(),
                req.getReason(),
                req.getSubjectName(),
                req.getAttachmentUrl(),
                req.getStatus()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Regularization requests retrieved", requestDtos));
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<ApiResponse<List<Object>>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Only teachers/admins can see pending requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(ApiResponse.success("Only teachers and admins can view pending requests", java.util.Collections.emptyList()));
        }
        
        List<AttendanceRegularizationRequest> requests = regularizationService.getPendingRequests();
        
        // Convert entities to DTOs for response
        List<Object> requestDtos = requests.stream().map(req -> {
            // Simplified conversion - in practice use MapStruct
            return new AttendanceRegularizationRequestDto(
                req.getId(),
                req.getStudent().getId(),
                req.getClassroom().getId(),
                req.getAttendanceDate(),
                req.getReason(),
                req.getSubjectName(),
                req.getAttachmentUrl(),
                req.getStatus()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Pending regularization requests retrieved", requestDtos));
    }

    @PutMapping("/request/{requestId}/approve")
    public ResponseEntity<ApiResponse<Object>> approveRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID requestId) {
        // Only teachers/admins can approve requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can approve requests");
        }
        
        AttendanceRegularizationRequest approvedRequest = regularizationService.approveRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Regularization request approved", approvedRequest));
    }

    @PutMapping("/request/{requestId}/reject")
    public ResponseEntity<ApiResponse<Object>> rejectRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID requestId) {
        // Only teachers/admins can reject requests
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        User user = authService.getUserRepository().findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is teacher or admin (simplified)
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can reject requests");
        }
        
        AttendanceRegularizationRequest rejectedRequest = regularizationService.rejectRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Regularization request rejected", rejectedRequest));
    }
}