package com.eduattend.sams.service;

import com.eduattend.sams.entity.*;
import com.eduattend.sams.repository.*;
import com.eduattend.sams.dto.chat.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageAttachmentRepository messageAttachmentRepository;

    @Mock
    private MessageReadStatusRepository messageReadStatusRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    private User testUser;
    private Conversation testConversation;
    private Message testMessage;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("1");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        testConversation = new Conversation();
        testConversation.setId(1L);
        testConversation.setType(Conversation.ConversationType.GROUP);
        testConversation.setClassroomId(100L);

        testMessage = Message.create();
        testMessage.setId(UUID.randomUUID());
        testMessage.setConversation(testConversation);
        testMessage.setSender(testUser);
        testMessage.setContent("Hello World");
        testMessage.setMessageType(MessageType.TEXT);
        testMessage.setCreatedAt(Instant.now());
        testMessage.setUpdatedAt(Instant.now());
    }

    @Test
    void testSendMessage() {
        // Arrange
        when(conversationRepository.findById(anyLong())).thenReturn(Optional.of(testConversation));
        when(userRepository.findById(anyString())).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // Act
        CreateMessageRequest request = new CreateMessageRequest(
                1L,
                "1",
                "Hello World",
                MessageType.TEXT
        );
        MessageResponse response = chatService.sendMessage(request);

        // Assert
        assertNotNull(response);
        assertEquals(testMessage.getId(), response.id());
        assertEquals(testConversation.getId(), response.conversationId());
        assertEquals(testUser.getId(), response.senderId());
        assertEquals("John Doe", response.senderName());
        assertEquals("Hello World", response.content());
        assertEquals(MessageType.TEXT, response.messageType());
    }

    @Test
    void testGetConversationById() {
        // Arrange
        when(conversationRepository.findById(1L)).thenReturn(Optional.of(testConversation));

        // Act
        ConversationResponse response = chatService.getConversationById(1L);

        // Assert
        assertNotNull(response);
        assertEquals(testConversation.getId(), response.id());
        assertEquals(testConversation.getType(), response.type());
        assertEquals(testConversation.getClassroomId(), response.classroomId());
    }

    @Test
    void testGetConversationByIdNotFound() {
        // Arrange
        when(conversationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        ConversationResponse response = chatService.getConversationById(999L);

        // Assert
        assertNull(response);
    }

    @Test
    void testMarkAsRead() {
        // Arrange
        UUID messageId = testMessage.getId();
        when(messageRepository.findById(messageId)).thenReturn(Optional.of(testMessage));
        when(messageReadStatusRepository.findByUserIdAndMessageId(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Act
        chatService.markAsRead(messageId.toString(), "1");

        // Assert
        verify(messageReadStatusRepository, times(1)).save(any(MessageReadStatus.class));
    }

    @Test
    void testCreatePrivateConversation() {
        // Arrange
        Conversation savedConversation = new Conversation();
        savedConversation.setId(1L);
        savedConversation.setType(Conversation.ConversationType.PRIVATE);
        savedConversation.setClassroomId(null);
        when(conversationRepository.save(any(Conversation.class))).thenReturn(savedConversation);

        // Act
        ConversationResponse response = chatService.createPrivateConversation("1", "2");

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(Conversation.ConversationType.PRIVATE, response.type());
        assertNull(response.classroomId());
    }

    @Test
    void testCreateGroupConversation() {
        // Arrange
        Conversation savedConversation = new Conversation();
        savedConversation.setId(1L);
        savedConversation.setType(Conversation.ConversationType.GROUP);
        savedConversation.setClassroomId(100L);
        when(conversationRepository.save(any(Conversation.class))).thenReturn(savedConversation);

        // Act
        ConversationResponse response = chatService.createGroupConversation(100L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(Conversation.ConversationType.GROUP, response.type());
        assertEquals(100L, response.classroomId());
    }
}