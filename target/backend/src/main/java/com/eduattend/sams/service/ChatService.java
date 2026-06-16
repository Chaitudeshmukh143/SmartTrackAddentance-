package com.eduattend.sams.service;

import com.eduattend.sams.entity.*;
import com.eduattend.sams.repository.*;
import com.eduattend.sams.dto.chat.*;
import com.eduattend.sams.config.AppProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageAttachmentRepository messageAttachmentRepository;

    @Autowired
    private MessageReadStatusRepository messageReadStatusRepository;

    @Autowired
    private com.eduattend.sams.repository.UserRepository userRepository;

    @Autowired
    private AppProperties appProperties;

    // Conversation methods
    public List<ConversationResponse> getConversationsForUser(String userId) {
        // TODO: Implement based on user's participation in conversations
        // For now, return all conversations (to be refined)
        return conversationRepository.findAll().stream()
                .map(ConversationResponse::fromEntity)
                .toList();
    }

    public ConversationResponse getConversationById(Long conversationId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        return conversation.map(ConversationResponse::fromEntity).orElse(null);
    }

    public ConversationResponse createPrivateConversation(String userId1, String userId2) {
        // Check if a private conversation already exists between these two users
        // TODO: Implement proper check
        Conversation conversation = new Conversation();
        conversation.setType(Conversation.ConversationType.PRIVATE);
        // Note: We don't have a direct link to users in conversation yet.
        // We might need to adjust the model to include participants.
        // For now, we'll set classroomId to null and rely on message sender/recipient.
        conversation.setClassroomId(null);
        conversation = conversationRepository.save(conversation);
        return ConversationResponse.fromEntity(conversation);
    }

    public ConversationResponse createGroupConversation(Long classroomId) {
        Conversation conversation = new Conversation();
        conversation.setType(Conversation.ConversationType.GROUP);
        conversation.setClassroomId(classroomId);
        conversation = conversationRepository.save(conversation);
        return ConversationResponse.fromEntity(conversation);
    }

    // Message methods
    public MessageResponse sendMessage(CreateMessageRequest request) {
        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(request.conversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Validate sender exists
        com.eduattend.sams.entity.User sender = userRepository.findById(request.senderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Message message = Message.create();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.content());
        message.setMessageType(request.messageType());
        message.setCreatedAt(Instant.now());
        message.setUpdatedAt(Instant.now());

        message = messageRepository.save(message);
        return MessageResponse.fromEntity(message);
    }

    public List<MessageResponse> getMessagesForConversation(Long conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // TODO: Implement pagination in MessageRepository
        // For now, get all and then paginate in memory (not efficient for large datasets)
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), messages.size());
        List<Message> pageContent = messages.subList(start, end);
        return pageContent.stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }

    public Optional<Message> getMessageById(UUID messageId) {
        return messageRepository.findById(messageId);
    }

    public void markAsRead(Long messageId, String userId) {
        Optional<Message> messageOpt = messageRepository.findById(UUID.fromString(messageId));
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            // Check if read status already exists
            Optional<MessageReadStatus> existing = messageReadStatusRepository.findByUserIdAndMessageId(
                    Long.valueOf(userId), messageId);
            if (existing.isEmpty()) {
                MessageReadStatus readStatus = new MessageReadStatus();
                readStatus.setMessage(message);
                readStatus.setUser(userRepository.findById(userId).orElseThrow());
                readStatus.setReadAt(Instant.now());
                messageReadStatusRepository.save(readStatus);
            }
        }
    }

    public Long getUnreadCount(String userId) {
        // TODO: Implement unread count calculation
        return 0L;
    }

    // File upload methods
    public MessageAttachmentResponse uploadFile(Long messageId, MultipartFile file) throws IOException {
        // Validate file is not empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size (10 MB max)
        long maxSize = 10 * 1024 * 1024; // 10 MB in bytes
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds 10 MB limit");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedFileType(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: jpg, jpeg, png, pdf, docx, xlsx");
        }

        // Validate message exists
        Optional<Message> messageOpt = messageRepository.findById(UUID.fromString(String.valueOf(messageId)));
        if (messageOpt.isEmpty()) {
            throw new IllegalArgumentException("Message not found");
        }

        // Generate unique filename to avoid collisions
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = StringUtils.getFilenameExtension(originalFileName);

        // If no extension found, try to get from content type as fallback
        if (fileExtension == null || fileExtension.isEmpty()) {
            fileExtension = getExtensionFromContentType(contentType);
            if (fileExtension == null || fileExtension.isEmpty()) {
                throw new IllegalArgumentException("File extension could not be determined");
            }
        }

        String storedFileName = UUID.randomUUID().toString() + "." + fileExtension;

        // Get upload directory from properties
        String uploadDir = appProperties.getFile().getUploadDir();
        Path uploadPath = Paths.get(uploadDir);

        // Create directory if it doesn't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file to local storage
        Path targetLocation = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Generate file URL (relative path for now, can be made absolute if needed)
        String fileUrl = "/uploads/" + storedFileName;

        // Create attachment record
        MessageAttachment attachment = new MessageAttachment();
        attachment.setMessage(messageOpt.get());
        attachment.setFileName(originalFileName);
        attachment.setFileType(fileExtension);
        attachment.setFileUrl(fileUrl);
        attachment.setFileSize(file.getSize());
        attachment = messageAttachmentRepository.save(attachment);

        return new MessageAttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFileType(),
                attachment.getFileUrl(),
                attachment.getFileSize(),
                attachment.getCreatedAt(),
                attachment.getUpdatedAt()
        );
    }

    // Helper method to check allowed file types by MIME type
    private boolean isAllowedFileType(String contentType) {
        return switch (contentType) {
            case "image/jpeg", "image/jpg", "image/png", "application/pdf",
                 "application/msword", // .doc
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                 "application/vnd.ms-excel", // .xls
                 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" -> true; // .xlsx
            default -> false;
        };
    }

    // Helper method to get file extension from content type
    private String getExtensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "application/pdf" -> "pdf";
            case "application/msword" -> "doc";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> "docx";
            case "application/vnd.ms-excel" -> "xls";
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" -> "xlsx";
            default -> null;
        };
    }

    // DTO for attachment response
    public record MessageAttachmentResponse(
            Long id,
            String fileName,
            String fileType,
            String fileUrl,
            Long fileSize,
            Instant createdAt,
            Instant updatedAt
    ) {}
}