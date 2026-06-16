package com.eduattend.sams.event;

import com.eduattend.sams.entity.Announcement;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.entity.Classroom;
import com.eduattend.sams.entity.ClassroomMembership;
import com.eduattend.sams.repository.ClassroomMembershipRepository;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Listener for AnnouncementCreatedEvent. Sends a notification to all classroom members when an announcement is created.
 */
@Component
public class AnnouncementCreatedEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ClassroomMembershipRepository classroomMembershipRepository;

    public AnnouncementCreatedEventListener(NotificationService notificationService,
                                            UserRepository userRepository,
                                            ClassroomMembershipRepository classroomMembershipRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.classroomMembershipRepository = classroomMembershipRepository;
    }

    @EventListener
    public void handleAnnouncementCreatedEvent(AnnouncementCreatedEvent event) {
        Announcement announcement = event.getAnnouncement();
        User createdBy = event.getCreatedBy();

        // Get the classroom for the announcement
        Classroom classroom = announcement.getClassroom();
        if (classroom == null) {
            // If the announcement is not associated with a classroom, we might send it to all users or just the creator.
            // But according to the requirement, announcements are for classroom members.
            // We'll assume that an announcement must have a classroom.
            return;
        }

        // Get all members of the classroom (students and teachers)
        List<ClassroomMembership> memberships = classroomMembershipRepository.findByClassroomId(classroom.getId());
        for (ClassroomMembership membership : memberships) {
            User user = membership.getUser();
            // Do not send a notification to the creator if they are also a member? The requirement doesn't specify.
            // We'll send to all members, including the creator.
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.ANNOUNCEMENT,
                    "New Announcement: " + announcement.getTitle(),
                    announcement.getContent(),
                    NotificationPriority.MEDIUM,
                    // We can set an actionUrl to link to the announcement details page
                    // For now, we'll leave it as null
                    null,
                    createdBy.getId() // The notification is created by the user who created the announcement
            );
        }
    }
}