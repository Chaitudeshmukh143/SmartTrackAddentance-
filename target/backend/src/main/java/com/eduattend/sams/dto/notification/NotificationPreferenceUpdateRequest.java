package com.eduattend.sams.dto.notification;

/**
 * DTO for updating notification preferences.
 * All fields are optional to allow partial updates.
 */
public record NotificationPreferenceUpdateRequest(
        Boolean emailEnabled,
        Boolean pushEnabled,
        Boolean attendanceEnabled,
        Boolean leaveEnabled,
        Boolean announcementEnabled,
        Boolean holidayEnabled,
        Boolean chatEnabled,
        Boolean systemEnabled
) {
}