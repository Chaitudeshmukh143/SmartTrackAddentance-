package com.eduattend.sams.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "message_read_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadStatus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private com.eduattend.sams.entity.User user;

    @Column(nullable = false)
    private Instant readAt;
}