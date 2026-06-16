package com.eduattend.sams.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private boolean emailEnabled = true;

    @Column(nullable = false)
    private boolean pushEnabled = true;

    @Column(nullable = false)
    private boolean attendanceEnabled = true;

    @Column(nullable = false)
    private boolean leaveEnabled = true;

    @Column(nullable = false)
    private boolean announcementEnabled = true;

    @Column(nullable = false)
    private boolean holidayEnabled = true;

    @Column(nullable = false)
    private boolean chatEnabled = true;

    @Column(nullable = false)
    private boolean systemEnabled = true;

    // Constructor for creating default preferences for a user
    public NotificationPreference(User user) {
        this.user = user;
        // Default values are already set in the field declarations
    }
}