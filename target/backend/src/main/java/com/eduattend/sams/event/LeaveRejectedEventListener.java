package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Listener for LeaveRejectedEvent. Sends a notification to the user when their leave is rejected.
 */
@Component
public class LeaveRejectedEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public LeaveRejectedEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleLeaveRejectedEvent(LeaveRejectedEvent event) {
        UUID userId = event.getUserId();
        String leaveType = event.getLeaveType();
        String rejectionReason = event.getRejectionReason();

        // Get the user to ensure they exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String title = "Leave Rejected";
        String message = "Your " + leaveType + " request has been rejected. Reason: " + rejectionReason + ".";

        notificationService.createNotification(
                userId,
                NotificationType.LEAVE,
                title,
                message,
                NotificationPriority.MEDIUM,
                null, // actionUrl
                null  // createdBy
        );
    }
}