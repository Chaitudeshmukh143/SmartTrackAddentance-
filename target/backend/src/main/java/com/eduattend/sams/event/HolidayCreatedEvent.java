package com.eduattend.sams.event;

import com.eduattend.sams.entity.Holiday;
import com.eduattend.sams.entity.User;

/**
 * Event published when a holiday is created.
 */
public class HolidayCreatedEvent {

    private final Holiday holiday;
    private final User createdBy;

    public HolidayCreatedEvent(Holiday holiday, User createdBy) {
        this.holiday = holiday;
        this.createdBy = createdBy;
    }

    public Holiday getHoliday() {
        return holiday;
    }

    public User getCreatedBy() {
        return createdBy;
    }
}