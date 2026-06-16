package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Listener for AttendanceMarkedEvent. Sends a notification to the student when attendance is marked.
 */
@Component
public class AttendanceMarkedEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public AttendanceMarkedEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleAttendanceMarkedEvent(AttendanceMarkedEvent event) {
        UUID studentId = event.getStudentId();
        boolean present = event.isPresent();
        String courseName = event.getCourseName();

        // Get the student user to ensure they exist (optional, but good practice)
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        String status = present ? "Present" : "Absent";
        String title = "Attendance Marked";
        String message = "Your attendance for " + courseName + " has been marked as " + status + ".";

        // We can set the actionUrl to link to the attendance details page, but we don't have that yet.
        // We'll leave it as null for now.
        notificationService.createNotification(
                studentId,
                NotificationType.ATTENDANCE,
                title,
                message,
                NotificationPriority.MEDIUM,
                null, // actionUrl
                null  // createdBy (we could set it to the system or the user who marked the attendance, but we don't have that info in the event)
        );
    }
}