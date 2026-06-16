package com.eduattend.sams.service;

import com.eduattend.sams.dto.notification.NotificationPreferenceUpdateRequest;
import com.eduattend.sams.entity.NotificationPreference;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.NotificationPreferenceRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationPreference getOrCreatePreferences(UUID userId) {
        // Verify the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<NotificationPreference> existing = notificationPreferenceRepository.findByUserId(user.getId());
        return existing.orElseGet(() -> {
            NotificationPreference preference = new NotificationPreference(user);
            return notificationPreferenceRepository.save(preference);
        });
    }

    public NotificationPreference getPreferences(UUID userId) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification preferences not found for user"));
    }

    @Transactional
    public NotificationPreference updatePreferences(UUID userId, NotificationPreferenceUpdateRequest updateRequest) {
        NotificationPreference preferences = getPreferences(userId);
        
        // Update only the fields that are provided in the request (non-null)
        if (updateRequest.emailEnabled() != null) {
            preferences.setEmailEnabled(updateRequest.emailEnabled());
        }
        if (updateRequest.pushEnabled() != null) {
            preferences.setPushEnabled(updateRequest.pushEnabled());
        }
        if (updateRequest.attendanceEnabled() != null) {
            preferences.setAttendanceEnabled(updateRequest.attendanceEnabled());
        }
        if (updateRequest.leaveEnabled() != null) {
            preferences.setLeaveEnabled(updateRequest.leaveEnabled());
        }
        if (updateRequest.announcementEnabled() != null) {
            preferences.setAnnouncementEnabled(updateRequest.announcementEnabled());
        }
        if (updateRequest.holidayEnabled() != null) {
            preferences.setHolidayEnabled(updateRequest.holidayEnabled());
        }
        if (updateRequest.chatEnabled() != null) {
            preferences.setChatEnabled(updateRequest.chatEnabled());
        }
        if (updateRequest.systemEnabled() != null) {
            preferences.setSystemEnabled(updateRequest.systemEnabled());
        }

        return notificationPreferenceRepository.save(preferences);
    }
}