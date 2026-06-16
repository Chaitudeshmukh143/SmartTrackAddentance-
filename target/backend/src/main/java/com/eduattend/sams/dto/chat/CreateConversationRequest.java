package com.eduattend.sams.dto.chat;

import com.eduattend.sams.entity.Conversation;
import java.time.Instant;

public record CreateConversationRequest(
        Conversation.ConversationType type,
        Long classroomId
) {
    public Conversation toEntity() {
        Conversation conversation = new Conversation();
        conversation.setType(type);
        conversation.setClassroomId(classroomId);
        return conversation;
    }
}