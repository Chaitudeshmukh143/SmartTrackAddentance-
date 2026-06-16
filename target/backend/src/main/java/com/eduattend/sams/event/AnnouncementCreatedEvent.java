package com.eduattend.sams.event;

import com.eduattend.sams.entity.Announcement;
import com.eduattend.sams.entity.User;

/**
 * Event published when an announcement is created.
 */
public class AnnouncementCreatedEvent {

    private final Announcement announcement;
    private final User createdBy;

    public AnnouncementCreatedEvent(Announcement announcement, User createdBy) {
        this.announcement = announcement;
        this.createdBy = createdBy;
    }

    public Announcement getAnnouncement() {
        return announcement;
    }

    public User getCreatedBy() {
        return createdBy;
    }
}