package com.eduattend.sams.service;

import com.eduattend.sams.dto.notification.NotificationResponse;
import com.eduattend.sams.entity.Notification;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.NotificationPriority;
import com.eduattend.sams.enums.NotificationType;
import com.eduattend.sams.repository.NotificationRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(UUID userId, NotificationType type, String title, String message) {
        return createNotification(userId, type, title, message, NotificationPriority.MEDIUM, null, null);
    }

    @Transactional
    public Notification createNotification(UUID userId, NotificationType type, String title, String message, 
                                         NotificationPriority priority, String actionUrl, UUID createdBy) {
        // Verify the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Notification notification = Notification.create();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(priority);
        notification.setActionUrl(actionUrl);
        notification.setCreatedBy(createdBy);
        notification.setCreatedAt(Instant.now());
        notification.setUpdatedAt(Instant.now());

        Notification saved = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        sendNotificationViaWebSocket(saved);

        return saved;
    }

    private void sendNotificationViaWebSocket(Notification notification) {
        // Convert to DTO for WebSocket message
        NotificationResponse response = NotificationResponse.fromEntity(notification);
        // Send to the user's personal topic
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + notification.getUser().getId(),
                response
        );
    }

    @Transactional
    public Notification markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        // Verify that the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        notificationRepository.markAllAsReadByUserId(userId);
    }

    public List<Notification> getNotifications(UUID userId, int page, int size, 
                                               NotificationType type, Boolean readStatus,
                                               NotificationPriority priority, Instant startDate, Instant endDate) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // For now, we'll implement basic filtering and ignore pagination complexity
        // In a production app, we'd use Specifications or Querydsl for complex filtering
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Apply filters
        return notifications.stream()
                .filter(n -> type == null || n.getType() == type)
                .filter(n -> readStatus == null || n.isRead() == readStatus)
                .filter(n -> priority == null || n.getPriority() == priority)
                .filter(n -> startDate == null || !n.getCreatedAt().isBefore(startDate))
                .filter(n -> endDate == null || !n.getCreatedAt().isAfter(endDate))
                .toList();
    }

    public List<Notification> getUnreadNotifications(UUID userId) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public int getUnreadCount(UUID userId) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification getNotificationById(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        // Verify that the notification belongs to the user (or user is admin - simplified check)
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only access your own notifications");
        }

        return notification;
    }

    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        // Verify that the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }
}