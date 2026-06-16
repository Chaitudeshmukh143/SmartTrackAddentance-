package com.eduattend.sams.dto.notification;

/**
 * DTO for returning notification preferences data to the client.
 */
public record NotificationPreferenceResponse(
        boolean emailEnabled,
        boolean pushEnabled,
        boolean attendanceEnabled,
        boolean leaveEnabled,
        boolean announcementEnabled,
        boolean holidayEnabled,
        boolean chatEnabled,
        boolean systemEnabled
) {
    /**
     * Converts a NotificationPreference entity to a NotificationPreferenceResponse DTO.
     *
     * @param preference the entity to convert
     * @return the DTO
     */
    public static NotificationPreferenceResponse fromEntity(NotificationPreference preference) {
        return new NotificationPreferenceResponse(
                preference.isEmailEnabled(),
                preference.isPushEnabled(),
                preference.isAttendanceEnabled(),
                preference.isLeaveEnabled(),
                preference.isAnnouncementEnabled(),
                preference.isHolidayEnabled(),
                preference.isChatEnabled(),
                preference.isSystemEnabled()
        );
    }
}