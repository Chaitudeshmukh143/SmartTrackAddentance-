package com.eduattend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    private String classroomId;
    private String senderId;
    private String senderName;
    private String recipientId;

    @Column(length = 2000)
    private String text;

    private String timestamp;
    private String role;
}
