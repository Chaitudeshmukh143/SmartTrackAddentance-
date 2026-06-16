package com.eduattend.sams.entity;

import com.eduattend.sams.enums.NotificationPriority;
import com.eduattend.sams.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority;

    @Column(nullable = false)
    private boolean read;

    private Instant readAt;

    private String actionUrl;

    private String metadataJson;

    private UUID createdBy;

    public static Notification create() {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setRead(false);
        notification.setPriority(NotificationPriority.MEDIUM); // default priority
        return notification;
    }
}