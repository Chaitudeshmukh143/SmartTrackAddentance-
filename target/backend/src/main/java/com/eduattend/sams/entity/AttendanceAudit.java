package com.eduattend.sams.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "attendance_audit")
public class AttendanceAudit {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID sessionId;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private String action; // MARKED, UPDATED, DELETED

    @Column(nullable = false)
    private Instant timestamp;

    @Column(length = 1000)
    private String metadata;

    public static AttendanceAudit create() {
        AttendanceAudit audit = new AttendanceAudit();
        audit.setId(UUID.randomUUID());
        return audit;
    }
}