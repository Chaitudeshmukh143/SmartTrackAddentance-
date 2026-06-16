package com.eduattend.sams.entity;

import com.eduattend.sams.enums.SecurityLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession extends BaseEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private Instant startTime;

    private Instant endTime;

    @Column(nullable = false)
    private Instant expiresAt;

    private Integer allowedRadiusMeters;

    private Double latitude;

    private Double longitude;

    // New fields for security
    private String sessionToken;

    @Column(name = "created_by")
    private UUID createdBy;

    @Enumerated(jakarta.persistence.EnumType.STRING)
    private SecurityLevel securityLevel;

    private boolean locationValidationEnabled;

    private boolean deviceValidationEnabled;

    private Integer attendanceWindowMinutes;

    public static AttendanceSession create() {
        AttendanceSession session = new AttendanceSession();
        session.setId(UUID.randomUUID());
        return session;
    }
}