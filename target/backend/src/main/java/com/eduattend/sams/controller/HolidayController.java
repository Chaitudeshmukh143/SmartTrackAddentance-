package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.holiday.HolidayDto;
import com.eduattend.sams.entity.Holiday;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.HolidayType;
import com.eduattend.sams.service.HolidayService;
import com.eduattend.sams.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/holidays")
public class HolidayController {

    private final HolidayService holidayService;
    private final AuthService authService;

    public HolidayController(HolidayService holidayService, AuthService authService) {
        this.holidayService = holidayService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createHoliday(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody HolidayDto holidayDto) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        
        // Convert DTO to entity
        Holiday holiday = new Holiday();
        holiday.setTitle(holidayDto.getTitle());
        holiday.setDescription(holidayDto.getDescription());
        holiday.setHolidayType(holidayDto.getHolidayType());
        holiday.setDate(holidayDto.getDate());
        
        Holiday createdHoliday = holidayService.createHoliday(userId, holiday);
        return ResponseEntity.ok(ApiResponse.success("Holiday created", createdHoliday));
    }

    @PutMapping("/{holidayId}")
    public ResponseEntity<ApiResponse<Object>> updateHoliday(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID holidayId,
            @Valid @RequestBody HolidayDto holidayDto) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        
        // Convert DTO to entity
        Holiday holidayDetails = new Holiday();
        holidayDetails.setTitle(holidayDto.getTitle());
        holidayDetails.setDescription(holidayDto.getDescription());
        holidayDetails.setHolidayType(holidayDto.getHolidayType());
        holidayDetails.setDate(holidayDto.getDate());
        
        Holiday updatedHoliday = holidayService.updateHoliday(holidayId, userId, holidayDetails);
        return ResponseEntity.ok(ApiResponse.success("Holiday updated", updatedHoliday));
    }

    @DeleteMapping("/{holidayId}")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID holidayId) {
        UUID userId = authService.getUserRepository().findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        holidayService.deleteHoliday(holidayId, userId);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> getAllHolidays(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Any authenticated user can view holidays
        List<Holiday> holidays = holidayService.getAllHolidays();
        
        // Convert entities to DTOs for response (simplified - in a real app we'd use MapStruct)
        List<Object> holidayDtos = holidays.stream().map(holiday -> {
            // Simplified conversion - in practice use MapStruct
            return new HolidayDto(
                holiday.getId(),
                holiday.getTitle(),
                holiday.getDescription(),
                holiday.getHolidayType(),
                holiday.getDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Holidays retrieved", holidayDtos));
    }

    @GetMapping("/date")
    public ResponseEntity<ApiResponse<List<Object>>> getHolidaysByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam LocalDate date) {
        List<Holiday> holidays = holidayService.getHolidaysByDate(date);
        
        // Convert entities to DTOs for response
        List<Object> holidayDtos = holidays.stream().map(holiday -> {
            // Simplified conversion - in practice use MapStruct
            return new HolidayDto(
                holiday.getId(),
                holiday.getTitle(),
                holiday.getDescription(),
                holiday.getHolidayType(),
                holiday.getDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Holidays by date retrieved", holidayDtos));
    }

    @GetMapping("/type")
    public ResponseEntity<ApiResponse<List<Object>>> getHolidaysByType(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam HolidayType type) {
        List<Holiday> holidays = holidayService.getHolidaysByType(type);
        
        // Convert entities to DTOs for response
        List<Object> holidayDtos = holidays.stream().map(holiday -> {
            // Simplified conversion - in practice use MapStruct
            return new HolidayDto(
                holiday.getId(),
                holiday.getTitle(),
                holiday.getDescription(),
                holiday.getHolidayType(),
                holiday.getDate()
            );
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Holidays by type retrieved", holidayDtos));
    }
}