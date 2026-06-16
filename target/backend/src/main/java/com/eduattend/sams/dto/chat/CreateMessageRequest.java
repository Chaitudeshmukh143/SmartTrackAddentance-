package com.eduattend.sams.dto.chat;

import com.eduattend.sams.enums.MessageType;

public record CreateMessageRequest(
        Long conversationId,
        String senderId,
        String content,
        MessageType messageType
) {
}