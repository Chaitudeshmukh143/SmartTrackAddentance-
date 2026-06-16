package com.eduattend.sams.controller;

import com.eduattend.sams.dto.chat.*;
import com.eduattend.sams.entity.*;
import com.eduattend.sams.service.ChatService;
import com.eduattend.sams.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            // In a real app, we'd fetch the user from the database by username/email
            // For now, we'll return a mock user or handle this differently
            return null; // Placeholder - implement based on your UserDetails implementation
        }
        return null;
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        // Fallback for development
        return "1";
    }

    // REST APIs for Conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        // In a real implementation, we would get the current user's conversations
        // For now, we'll return all conversations (to be refined with proper filtering)
        return ResponseEntity.ok(chatService.getConversationsForUser(getCurrentUserId()));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable Long id) {
        ConversationResponse conversation = chatService.getConversationById(id);
        if (conversation == null) {
            return ResponseEntity.notFound().build();
        }
        
        // TODO: Add authorization check - verify user has access to this conversation
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/conversations/private")
    public ResponseEntity<ConversationResponse> createPrivateConversation(@RequestParam String userId) {
        String currentUserId = getCurrentUserId();
        // TODO: Add validation that current user can create conversation with target user
        ConversationResponse conversation = chatService.createPrivateConversation(currentUserId, userId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/conversations/group")
    public ResponseEntity<ConversationResponse> createGroupConversation(@RequestParam Long classroomId) {
        // TODO: Add authorization check - verify user is member of the classroom
        ConversationResponse conversation = chatService.createGroupConversation(classroomId);
        return ResponseEntity.ok(conversation);
    }

    // REST APIs for Messages
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // TODO: Add authorization check - verify user has access to this conversation
        List<MessageResponse> messages = chatService.getMessagesForConversation(conversationId, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody CreateMessageRequest request) {
        // TODO: Add authorization check - verify user is sender and has access to conversation
        MessageResponse message = chatService.sendMessage(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/messages/{messageId}/attachments")
    public ResponseEntity<MessageAttachmentResponse> uploadAttachment(
            @PathVariable Long messageId,
            @RequestParam("file") MultipartFile file) throws IOException {
        // TODO: Add authorization check - verify user has access to this message
        MessageAttachmentResponse attachment = chatService.uploadFile(messageId, file);
        return ResponseEntity.ok(attachment);
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        // TODO: Implement message deletion with proper authorization
        // Only allow deletion by sender or admin within time limit
        return ResponseEntity.noContent().build();
    }

    // WebSocket endpoints
    @MessageMapping("/chat/send")
    public void handleSendMessage(@Payload ChatMessageRequest request) {
        // TODO: Add authorization check - verify user is sender and has access to conversation
        // Convert to service request and send
        CreateMessageRequest createRequest = new CreateMessageRequest(
                request.getConversationId(),
                request.getSenderId(),
                request.getContent(),
                request.getMessageType()
        );
        
        MessageResponse response = chatService.sendMessage(createRequest);
        
        // Send to appropriate topic based on conversation type
        // TODO: Get conversation type to determine topic
        messagingTemplate.convertAndSend(
                "/topic/messages/" + request.getConversationId(),
                response
        );
    }

    @MessageMapping("/chat/typing")
    public void handleTypingIndicator(@Payload TypingIndicatorRequest request) {
        // TODO: Add authorization check - verify user is participant in conversation
        // Broadcast typing indicator to conversation participants
        messagingTemplate.convertAndSend(
                "/topic/typing/" + request.getConversationId(),
                request
        );
    }

    @MessageMapping("/chat/read")
    public void handleReadReceipt(@Payload ReadReceiptRequest request) {
        // TODO: Add authorization check - verify user is participant in conversation
        chatService.markAsRead(request.getMessageId(), request.getUserId());
        
        // Broadcast read receipt to sender
        // TODO: Get message sender and send to their personal topic
        messagingTemplate.convertAndSend(
                "/topic/read/" + request.getMessageId(),
                new ReadReceiptResponse(request.getMessageId(), request.getUserId())
        );
    }

    // DTO for WebSocket send message request
    public record ChatMessageRequest(
            Long conversationId,
            String senderId,
            String content,
            String messageType
    ) {}

    // DTO for WebSocket typing indicator request
    public record TypingIndicatorRequest(
            Long conversationId,
            String userId,
            boolean isTyping
    ) {}

    // DTO for WebSocket read receipt request
    public record ReadReceiptRequest(
            Long messageId,
            String userId
    ) {}

    // DTO for WebSocket read receipt response
    public record ReadReceiptResponse(
            Long messageId,
            String userId
    ) {}
}