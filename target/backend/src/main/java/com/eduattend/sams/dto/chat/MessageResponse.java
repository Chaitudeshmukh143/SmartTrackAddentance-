package com.eduattend.sams.dto.chat;

import com.eduattend.sams.entity.Message;
import com.eduattend.sams.enums.MessageType;
import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        Long conversationId,
        String senderId,
        String senderName,
        String content,
        MessageType messageType,
        Instant createdAt,
        Instant updatedAt
) {
    public static MessageResponse fromEntity(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getFirstName() + " " + message.getSender().getLastName(),
                message.getContent(),
                message.getMessageType(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}