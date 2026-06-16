package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Listener for LeaveApprovedEvent. Sends a notification to the user when their leave is approved.
 */
@Component
public class LeaveApprovedEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public LeaveApprovedEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleLeaveApprovedEvent(LeaveApprovedEvent event) {
        UUID userId = event.getUserId();
        String leaveType = event.getLeaveType();
        String startDate = event.getStartDate();
        String endDate = event.getEndDate();

        // Get the user to ensure they exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String title = "Leave Approved";
        String message = "Your " + leaveType + " request from " + startDate + " to " + endDate + " has been approved.";

        notificationService.createNotification(
                userId,
                NotificationType.LEAVE,
                title,
                message,
                NotificationPriority.MEDIUM,
                null, // actionUrl
                null  // createdBy (we could set it to the admin or system, but we don't have that info)
        );
    }
}