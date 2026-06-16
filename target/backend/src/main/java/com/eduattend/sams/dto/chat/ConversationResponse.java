package com.eduattend.sams.dto.chat;

import com.eduattend.sams.entity.Conversation;
import java.time.Instant;

public record ConversationResponse(
        Long id,
        Conversation.ConversationType type,
        Long classroomId,
        Instant createdAt,
        Instant updatedAt
) {
    public static ConversationResponse fromEntity(Conversation conversation) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getType(),
                conversation.getClassroomId(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}