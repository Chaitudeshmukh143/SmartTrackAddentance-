package com.eduattend.sams.service;

import com.eduattend.sams.entity.Announcement;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.AnnouncementRepository;
import com.eduattend.sams.repository.ClassroomRepository;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final NotificationService notificationService;

    @Transactional
    public Announcement createAnnouncement(UUID userId, Announcement announcement) {
        // Verify the user exists and is a teacher
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can create announcements");
        }

        // If classroomId is provided, verify the classroom exists
        if (announcement.getClassroom() != null) {
            classroomRepository.findById(announcement.getClassroom().getId())
                    .orElseThrow(() -> new BadRequestException("Classroom not found"));
        }

        // Set the ID and publish date
        announcement.setId(UUID.randomUUID());
        announcement.setPublishDate(Instant.now());

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        // Send notifications to students in the classroom (if any) or to all students if no classroom specified?
        // According to the requirement: "Notifications generated automatically."
        // We'll send notifications to all students in the classroom (if specified) or to all students in the system? 
        // The requirement doesn't specify. Let's assume if a classroom is specified, notify only those students.
        // If no classroom is specified, then it's a global announcement and we notify all students.
        // But note: the requirement says "Students: View announcements", so we should notify students.
        // We'll implement a simple version: if classroom is set, notify students in that classroom.
        // Otherwise, notify all students.

        // However, we don't have a direct way to get all students. We can get all users with role STUDENT.
        // But for efficiency, we'll leave the notification logic to the NotificationService and just trigger it.
        // We'll call a method in NotificationService to send announcement notifications.

        // For now, we'll just note that we should send notifications and leave the implementation to the NotificationService.
        // We'll call a method that we assume exists: notificationService.sendAnnouncementNotification(savedAnnouncement);

        // Since we are building the notification service later, we'll just comment it out for now.
        // notificationService.sendAnnouncementNotification(savedAnnouncement);

        return savedAnnouncement;
    }

    @Transactional
    public Announcement updateAnnouncement(UUID announcementId, UUID userId, Announcement announcementDetails) {
        // Verify the user exists and is a teacher
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can update announcements");
        }

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new BadRequestException("Announcement not found"));

        // Verify that the user is the teacher who created the announcement
        if (!announcement.getTeacher().getId().equals(userId)) {
            throw new BadRequestException("Only the teacher who created the announcement can update it");
        }

        // If classroomId is provided, verify the classroom exists
        if (announcementDetails.getClassroom() != null) {
            classroomRepository.findById(announcementDetails.getClassroom().getId())
                    .orElseThrow(() -> new BadRequestException("Classroom not found"));
        }

        // Update the announcement
        announcement.setTitle(announcementDetails.getTitle());
        announcement.setMessage(announcementDetails.getMessage());
        announcement.setClassroom(announcementDetails.getClassroom());
        announcement.setAttachmentUrl(announcementDetails.getAttachmentUrl());
        // Note: We don't update the publish date on update? Or we might? Let's not change it.

        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(UUID announcementId, UUID userId) {
        // Verify the user exists and is a teacher
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER")) {
            throw new BadRequestException("Only teachers can delete announcements");
        }

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new BadRequestException("Announcement not found"));

        // Verify that the user is the teacher who created the announcement
        if (!announcement.getTeacher().getId().equals(userId)) {
            throw new BadRequestException("Only the teacher who created the announcement can delete it");
        }

        announcementRepository.delete(announcement);
    }

    public Announcement getAnnouncementById(UUID announcementId) {
        return announcementRepository.findById(announcementId)
                .orElseThrow(() -> new BadRequestException("Announcement not found"));
    }

    public List<Announcement> getAnnouncementsByTeacher(UUID teacherId) {
        return announcementRepository.findByTeacherId(teacherId);
    }

    public List<Announcement> getAnnouncementsByClassroom(UUID classroomId) {
        return announcementRepository.findByClassroomId(classroomId);
    }

    public List<Announcement> getRecentAnnouncements() {
        // Get announcements from the last 30 days
        Instant thirtyDaysAgo = Instant.now().minusSeconds(30L * 24 * 60 * 60);
        return announcementRepository.findByPublishDateAfter(thirtyDaysAgo);
    }
}