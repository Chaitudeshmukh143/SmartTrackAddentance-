package com.eduattend.sams.event;

import com.eduattend.sams.entity.User;

/**
 * Event published when a leave request is rejected.
 */
public class LeaveRejectedEvent {

    private final UUID userId;
    private final String leaveType;
    private final String rejectionReason;

    public LeaveRejectedEvent(UUID userId, String leaveType, String rejectionReason) {
        this.userId = userId;
        this.leaveType = leaveType;
        this.rejectionReason = rejectionReason;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}