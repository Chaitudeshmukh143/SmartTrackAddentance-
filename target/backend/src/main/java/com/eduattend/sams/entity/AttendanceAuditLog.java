package com.eduattend.sams.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceAuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_id")
    private AttendanceRecord attendance;

    @Column(nullable = false)
    private String action;

    private String deviceHash;

    private String ipAddress;

    private String location;

    private Integer riskScore;

}