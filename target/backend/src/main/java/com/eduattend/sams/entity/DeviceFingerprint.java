package com.eduattend.sams.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device_fingerprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceFingerprint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String deviceHash;

    @Column(nullable = false)
    private String browser;

    @Column(nullable = false)
    private String os;

    @Column(nullable = false)
    private String ipAddress;

    @Column(name = "last_seen")
    private Instant lastSeen;

}