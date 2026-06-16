package com.eduattend.sams.service;

import com.eduattend.sams.entity.*;
import com.eduattend.sams.enums.NotificationPriority;
import com.eduattend.sams.enums.NotificationType;
import com.eduattend.sams.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;
import java.util.UUID;

/**
 * Scheduler for sending periodic notifications.
 */
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final HolidayRepository holidayRepository;
    private final TeacherLeaveRequestRepository teacherLeaveRequestRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository classroomMembershipRepository;

    /**
     * Attendance Warning Job: Run daily at 8 AM.
     * Notify students with attendance below 75% for the current month.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendAttendanceWarnings() {
        // Get all students (users with role STUDENT)
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        for (User student : students) {
            // Calculate attendance percentage for the current month
            // We'll assume we have a method in AttendanceRecordRepository to get attendance percentage for a user for a given month
            double attendancePercentage = attendanceRecordRepository.getAttendancePercentageForStudentInMonth(
                    student.getId(),
                    YearMonth.now()
            );
            if (attendancePercentage < 75.0) {
                // Create a warning notification
                notificationService.createNotification(
                        student.getId(),
                        NotificationType.ATTENDANCE,
                        "Attendance Warning",
                        "Your attendance is below 75%. Please improve your attendance to avoid academic penalties.",
                        NotificationPriority.HIGH,
                        null, // actionUrl
                        null  // createdBy (system)
                );
            }
        }
    }

    /**
     * Holiday Reminder Job: Run hourly.
     * Send reminder 24 hours before a holiday starts.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendHolidayReminders() {
        // Get holidays that start within the next 24 hours
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusHours(24);
        List<Holiday> upcomingHolidays = holidayRepository.findByStartDateBetween(now, end);
        for (Holiday holiday : upcomingHolidays) {
            // Notify all users (or at least students and teachers) about the holiday
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers) {
                notificationService.createNotification(
                        user.getId(),
                        NotificationType.HOLIDAY,
                        "Holiday Reminder: " + holiday.getName(),
                        "Reminder: " + holiday.getName() + " starts on " + holiday.getStartDate() + ".",
                        NotificationPriority.MEDIUM,
                        null, // actionUrl
                        null  // createdBy (system)
                );
            }
        }
    }

    /**
     * Teacher Leave Reminder Job: Run hourly.
     * Notify students before class cancellation due to teacher leave.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendTeacherLeaveReminders() {
        // Get approved teacher leaves that start within the next hour
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusHours(1);
        List<TeacherLeaveRequest> upcomingTeacherLeaves = teacherLeaveRequestRepository.findByStatusAndStartDateBetween(
                TeacherLeaveStatus.APPROVED,
                now,
                end
        );
        for (TeacherLeaveRequest teacherLeave : upcomingTeacherLeaves) {
            // Get the classroom(s) for this teacher leave
            // We assume the teacher leave request has a classroomId or we can get it from the teacher
            // For simplicity, we'll assume the teacher leave request has a classroomId field.
            // If not, we might need to adjust.
            Long classroomId = teacherLeave.getClassroomId(); // Assuming this field exists
            if (classroomId != null) {
                // Get all students in this classroom
                List<User> students = classroomMembershipRepository.findStudentsByClassroomId(classroomId);
                for (User student : students) {
                    notificationService.createNotification(
                            student.getId(),
                            NotificationType.TEACHER_LEAVE,
                            "Class Cancellation Notice: " + teacherLeave.getTeacher().getFirstName() + " " + teacherLeave.getTeacher().getLastName(),
                            "Class for " + teacherLeave.getSubject() + " is cancelled on " + teacherLeave.getStartDate() + " due to teacher leave.",
                            NotificationPriority.HIGH,
                            null, // actionUrl
                            null  // createdBy (system)
                    );
                }
            }
        }
    }
}