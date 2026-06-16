package com.eduattend.sams.dto.notification;

import com.eduattend.sams.entity.Notification;
import com.eduattend.sams.enums.NotificationPriority;
import com.eduattend.sams.enums.NotificationType;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for returning notification data to the client.
 */
public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        NotificationType type,
        NotificationPriority priority,
        boolean read,
        Instant createdAt,
        Instant readAt,
        String actionUrl,
        String metadataJson,
        UUID createdBy
) {
    /**
     * Converts a Notification entity to a NotificationResponse DTO.
     *
     * @param notification the entity to convert
     * @return the DTO
     */
    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getPriority(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getReadAt(),
                notification.getActionUrl(),
                notification.getMetadataJson(),
                notification.getCreatedBy()
        );
    }
}