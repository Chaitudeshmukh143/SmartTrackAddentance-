package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;

/**
 * Event published when a teacher's leave request is approved.
 */
public class TeacherLeaveApprovedEvent {

    private final UUID teacherId;
    private final String subject;
    private final String startDate;
    private final String endDate;

    public TeacherLeaveApprovedEvent(UUID teacherId, String subject, String startDate, String endDate) {
        this.teacherId = teacherId;
        this.subject = subject;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public UUID getTeacherId() {
        return teacherId;
    }

    public String getSubject() {
        return subject;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }
}