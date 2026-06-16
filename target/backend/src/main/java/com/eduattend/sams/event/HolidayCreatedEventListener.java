package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;
import com.eduattend.sams.entity.Holiday;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Listener for HolidayCreatedEvent. Sends a notification to all users when a holiday is created.
 */
@Component
public class HolidayCreatedEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public HolidayCreatedEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleHolidayCreatedEvent(HolidayCreatedEvent event) {
        Holiday holiday = event.getHoliday();
        User createdBy = event.getCreatedBy();

        // Notify all users (or at least students and teachers) about the holiday
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.HOLIDAY,
                    "New Holiday: " + holiday.getName(),
                    "A new holiday has been added: " + holiday.getName() + " from " + holiday.getStartDate() + " to " + holiday.getEndDate() + ".",
                    NotificationPriority.MEDIUM,
                    null, // actionUrl
                    createdBy.getId() // createdBy
            );
        }
    }
}