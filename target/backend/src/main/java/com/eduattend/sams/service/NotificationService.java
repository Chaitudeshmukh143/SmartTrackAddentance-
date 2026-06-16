package com.eduattend.sams.service;

import com.eduattend.sams.entity.Notification;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.NotificationType;
import com.eduattend.sams.repository.NotificationRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public Notification createNotification(UUID userId, NotificationType type, String title, String body) {
        // Verify the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Notification notification = Notification.create();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setRead(false);

        return notificationRepository.save(notification);
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
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        notificationRepository.markAllAsReadByUserId(userId);
    }

    public List<Notification> getNotifications(UUID userId, int page, int size) {
        // Verify the user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // For simplicity, we'll ignore pagination for now and return all notifications.
        // In a real app, we'd use Pageable.
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
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
}