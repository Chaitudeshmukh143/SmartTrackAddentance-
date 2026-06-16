package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.announcement.AnnouncementDto;
import com.eduattend.sams.entity.Announcement;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.service.AnnouncementService;
import com.eduattend.sams.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final AuthService authService;

    public AnnouncementController(AnnouncementService announcementService, AuthService authService) {
        this.announcementService = announcementService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AnnouncementDto announcementDto) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        
        // Convert DTO to entity
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDto.getTitle());
        announcement.setMessage(announcementDto.getMessage());
        announcement.setClassroom(announcementDto.getClassroomId() != null ? 
                new com.eduattend.sams.entity.Classroom() {{ setId(announcementDto.getClassroomId()); }} : null);
        announcement.setAttachmentUrl(announcementDto.getAttachmentUrl());
        
        Announcement createdAnnouncement = announcementService.createAnnouncement(userId, announcement);
        return ResponseEntity.ok(ApiResponse.success("Announcement created", createdAnnouncement));
    }

    @PutMapping("/{announcementId}")
    public ResponseEntity<ApiResponse<Object>> updateAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID announcementId,
            @Valid @RequestBody AnnouncementDto announcementDto) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        
        // Convert DTO to entity
        Announcement announcementDetails = new Announcement();
        announcementDetails.setTitle(announcementDto.getTitle());
        announcementDetails.setMessage(announcementDto.getMessage());
        announcementDetails.setClassroom(announcementDto.getClassroomId() != null ? 
                new com.eduattend.sams.entity.Classroom() {{ setId(announcementDto.getClassroomId()); }} : null);
        announcementDetails.setAttachmentUrl(announcementDto.getAttachmentUrl());
        
        Announcement updatedAnnouncement = announcementService.updateAnnouncement(announcementId, userId, announcementDetails);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", updatedAnnouncement));
    }

    @DeleteMapping("/{announcementId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID announcementId) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        announcementService.deleteAnnouncement(announcementId, userId);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> getAllAnnouncements(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Any authenticated user can view announcements
        List<Announcement> announcements = announcementService.getRecentAnnouncements();
        
        // Convert entities to DTOs for response
        List<Object> announcementDtos = announcements.stream().map(announcement -> {
            // Simplified conversion - in practice use MapStruct
            return new AnnouncementDto(
                announcement.getId(),
                announcement.getTeacher().getId(),
                announcement.getClassroom() != null ? announcement.getClassroom().getId() : null,
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getAttachmentUrl(),
                announcement.getPublishDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved", announcementDtos));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<ApiResponse<List<Object>>> getAnnouncementsByTeacher(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID teacherId) {
        // Any authenticated user can view announcements by teacher
        List<Announcement> announcements = announcementService.getAnnouncementsByTeacher(teacherId);
        
        // Convert entities to DTOs for response
        List<Object> announcementDtos = announcements.stream().map(announcement -> {
            // Simplified conversion - in practice use MapStruct
            return new AnnouncementDto(
                announcement.getId(),
                announcement.getTeacher().getId(),
                announcement.getClassroom() != null ? announcement.getClassroom().getId() : null,
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getAttachmentUrl(),
                announcement.getPublishDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Announcements by teacher retrieved", announcementDtos));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<ApiResponse<List<Object>>> getAnnouncementsByClassroom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID classroomId) {
        // Any authenticated user can view announcements by classroom
        List<Announcement> announcements = announcementService.getAnnouncementsByClassroom(classroomId);
        
        // Convert entities to DTOs for response
        List<Object> announcementDtos = announcements.stream().map(announcement -> {
            // Simplified conversion - in practice use MapStruct
            return new AnnouncementDto(
                announcement.getId(),
                announcement.getTeacher().getId(),
                announcement.getClassroom() != null ? announcement.getClassroom().getId() : null,
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getAttachmentUrl(),
                announcement.getPublishDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Announcements by classroom retrieved", announcementDtos));
    }
}