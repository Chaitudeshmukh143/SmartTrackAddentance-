package com.eduattend.model;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
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
