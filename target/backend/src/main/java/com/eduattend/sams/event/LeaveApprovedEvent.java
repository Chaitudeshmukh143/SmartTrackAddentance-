package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;

/**
 * Event published when a leave request is approved.
 */
public class LeaveApprovedEvent {

    private final UUID userId;
    private final String leaveType; // e.g., Sick Leave, Casual Leave
    private final String startDate;
    private final String endDate;

    public LeaveApprovedEvent(UUID userId, String leaveType, String startDate, String endDate) {
        this.userId = userId;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }
}