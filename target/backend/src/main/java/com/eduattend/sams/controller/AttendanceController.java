package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.attendance.CreateAttendanceSessionRequest;
import com.eduattend.sams.entity.AttendanceRecord;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.service.AttendanceService;
import com.eduattend.sams.service.AuthService;
import com.eduattend.sams.service.QRAttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AuthService authService;
    private final QRAttendanceService qrAttendanceService;

    public AttendanceController(AttendanceService attendanceService, AuthService authService, QRAttendanceService qrAttendanceService) {
        this.attendanceService = attendanceService;
        this.authService = authService;
        this.qrAttendanceService = qrAttendanceService;
    }

    @PostMapping("/session")
    public ResponseEntity<ApiResponse<Object>> createAttendanceSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAttendanceSessionRequest request) {
        UUID teacherId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Teacher not found")).getId();
        return ResponseEntity.ok(ApiResponse.success("Attendance session created", attendanceService.createAttendanceSession(teacherId, request)));
    }

    @PostMapping("/session/{sessionId}/close")
    public ResponseEntity<ApiResponse<Void>> closeAttendanceSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID sessionId) {
        UUID teacherId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Teacher not found")).getId();
        attendanceService.closeAttendanceSession(sessionId, teacherId);
        return ResponseEntity.ok(ApiResponse.success("Attendance session closed", null));
    }

    @PostMapping("/session/{sessionId}/mark")
    public ResponseEntity<ApiResponse<Object>> markAttendance(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID sessionId,
            @RequestParam String deviceFingerprint,
            @RequestParam(required = false) Boolean browserVisibilityCompromised) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        AttendanceRecord record = attendanceService.markAttendance(sessionId, studentId, deviceFingerprint, browserVisibilityCompromised);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", record));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getAttendanceForSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID sessionId) {
        // In a real app, we'd check if the user is a teacher of this classroom or an admin
        List<AttendanceRecord> records = attendanceService.getAttendanceForSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved", records));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getAttendanceHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        List<AttendanceRecord> records = attendanceService.getAttendanceHistoryForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved", records));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<Object>> scanQrCode(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String token,
            @RequestParam String deviceFingerprint,
            @RequestParam(required = false) Boolean browserVisibilityCompromised) {
        UUID studentId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found")).getId();
        AttendanceRecord record = qrAttendanceService.scanAndMarkAttendance(token, studentId, deviceFingerprint, browserVisibilityCompromised);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked via QR scan", record));
    }
}