package com.eduattend.sams.websocket;

import com.eduattend.sams.dto.chat.*;
import com.eduattend.sams.entity.*;
import com.eduattend.sams.repository.*;
import com.eduattend.sams.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Controller
public class ChatWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(ChatWebSocketHandler.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private com.eduattend.sams.repository.UserRepository userRepository;

    // Send message to conversation
    @MessageMapping("/chat/send/{conversationId}")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            @Payload ChatMessageRequest request,
            Principal principal) {
        logger.info("Received message for conversation {}", conversationId);
        
        // Validate user is participant in conversation (simplified check)
        // In a real implementation, we'd check if user is part of the conversation
        
        // Create message using service
        CreateMessageRequest createRequest = new CreateMessageRequest(
                conversationId,
                request.getSenderId(),
                request.getContent(),
                MessageType.fromValue(request.getMessageType())
        );
        
        MessageResponse response = chatService.sendMessage(createRequest);
        
        // Send to conversation topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                response
        );
        
        // Send notification to participants (excluding sender)
        // TODO: Implement participant detection and notification
    }

    // Typing indicator
    @MessageMapping("/chat/typing/{conversationId}")
    public void typingIndicator(
            @DestinationVariable Long conversationId,
            @Payload TypingIndicatorRequest request,
            Principal principal) {
        logger.info("Typing indicator for conversation {}: user {} is {}", 
                conversationId, request.getUserId(), request.isTyping() ? "typing" : "not typing");
        
        // Broadcast to conversation topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/typing",
                request
        );
    }

    // Read receipt
    @MessageMapping("/chat/read/{messageId}")
    public void readReceipt(
            @DestinationVariable Long messageId,
            @Payload ReadReceiptRequest request,
            Principal principal) {
        logger.info("Read receipt for message {} by user {}", messageId, request.getUserId());
        
        // Mark as read using service
        chatService.markAsRead(messageId, request.getUserId());
        
        // Get message to find sender
        Optional<Message> messageOpt = chatService.getMessageById(UUID.fromString(String.valueOf(messageId)));
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            String senderId = message.getSender().getId();
            
            // Send read receipt to sender's personal topic
            messagingTemplate.convertAndSend(
                    "/topic/user/" + senderId + "/read/" + messageId,
                    new ReadReceiptResponse(messageId, request.getUserId())
            );
        }
    }

    // Get conversation history (for initial load)
    @MessageMapping("/chat/history/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}/history")
    public java.util.List<MessageResponse> getHistory(
            @DestinationVariable Long conversationId,
            @Payload PageRequest pageRequest) {
        logger.info("Loading history for conversation {} page {}", conversationId, pageRequest.getPageNumber());
        // TODO: Implement actual pagination in service
        // For now, return first page
        return chatService.getMessagesForConversation(conversationId, pageRequest.getPageNumber(), pageRequest.getPageSize());
    }

    // User connection/disconnection events would be handled elsewhere
    // For online presence, we'd typically use @EventListener for SessionConnectedEvent/SessionDisconnectEvent

    // Exception handler
    @MessageExceptionHandler
    public void handleException(Exception exception) {
        logger.error("WebSocket error: {}", exception.getMessage(), exception);
    }

    // Helper method to get current user
    private String getCurrentUserId(Principal principal) {
        if (principal != null) {
            return principal.getName();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            return ((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()).getUsername();
        }
        return "anonymous";
    }

    // DTOs for WebSocket messages
    public record ChatMessageRequest(
            String senderId,
            String content,
            String messageType
    ) {}

    public record TypingIndicatorRequest(
            String userId,
            boolean isTyping
    ) {}

    public record ReadReceiptRequest(
            String userId
    ) {}

    public record ReadReceiptResponse(
            Long messageId,
            String userId
    ) {}
}