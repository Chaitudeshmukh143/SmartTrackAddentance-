package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;

/**
 * Event published when attendance is marked for a student.
 */
public class AttendanceMarkedEvent {

    private final UUID studentId;
    private final boolean present;
    private final String courseName;

    public AttendanceMarkedEvent(UUID studentId, boolean present, String courseName) {
        this.studentId = studentId;
        this.present = present;
        this.courseName = courseName;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public boolean isPresent() {
        return present;
    }

    public String getCourseName() {
        return courseName;
    }
}