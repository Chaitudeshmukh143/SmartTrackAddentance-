package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.config.AppProperties;
import com.eduattend.sams.dto.attendance.CreateAttendanceSessionRequest;
import com.eduattend.sams.dto.classroom.ClassroomResponse;
import com.eduattend.sams.dto.classroom.CreateClassroomRequest;
import com.eduattend.sams.dto.classroom.UpdateClassroomRequest;
import com.eduattend.sams.entity.AttendanceSession;
import com.eduattend.sams.security.AuthenticatedUser;
import com.eduattend.sams.service.ClassroomManagementService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/classrooms")
public class ClassroomManagementController {

    private final ClassroomManagementService classroomManagementService;
    private final AppProperties appProperties;

    public ClassroomManagementController(ClassroomManagementService classroomManagementService, AppProperties appProperties) {
        this.classroomManagementService = classroomManagementService;
        this.appProperties = appProperties;
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getTeacherClassrooms(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.success("Classrooms fetched", classroomManagementService.getTeacherClassrooms(user.getId())));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateClassroomRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Classroom created", classroomManagementService.createClassroom(user.getId(), request)));
    }

    @PutMapping("/{classroomId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID classroomId,
            @Valid @RequestBody UpdateClassroomRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Classroom updated", classroomManagementService.updateClassroom(user.getId(), classroomId, request)));
    }

    @PatchMapping("/{classroomId}/archive")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> archiveClassroom(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID classroomId) {
        classroomManagementService.archiveClassroom(user.getId(), classroomId);
        return ResponseEntity.ok(ApiResponse.success("Classroom archived", null));
    }

    @DeleteMapping("/{classroomId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID classroomId) {
        classroomManagementService.deleteClassroom(user.getId(), classroomId);
        return ResponseEntity.ok(ApiResponse.success("Classroom deleted", null));
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> joinClassroom(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam String joinCode
    ) {
        return ResponseEntity.ok(ApiResponse.success("Joined classroom", classroomManagementService.joinClassroom(user.getId(), joinCode)));
    }

    @PostMapping("/{classroomId}/attendance-sessions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAttendanceSession(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID classroomId,
            @Valid @RequestBody(required = false) CreateAttendanceSessionRequest request
    ) {
        CreateAttendanceSessionRequest payload = request == null
                ? new CreateAttendanceSessionRequest(null, null, null, null)
                : request;
        AttendanceSession session = classroomManagementService.createAttendanceSession(
                user.getId(),
                classroomId,
                payload,
                appProperties.getAttendance().getDefaultExpiryMinutes(),
                appProperties.getAttendance().getDefaultRadiusMeters()
        );
        Map<String, Object> response = Map.of(
                "sessionId", session.getId(),
                "classroomId", classroomId,
                "attendanceDate", session.getAttendanceDate(),
                "startTime", session.getStartTime(),
                "expiryTime", session.getExpiresAt(),
                "allowedRadiusMeters", session.getAllowedRadiusMeters()
        );
        return ResponseEntity.ok(ApiResponse.success("Attendance session created", response));
    }
}
