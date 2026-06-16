package com.eduattend.sams.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private com.eduattend.sams.entity.User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusType status;

    @Column(name = "last_seen")
    private Instant lastSeen;

    public enum StatusType {
        ONLINE, OFFLINE
    }
}