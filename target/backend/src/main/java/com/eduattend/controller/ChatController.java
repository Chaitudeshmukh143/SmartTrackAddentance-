package com.eduattend.controller;

import com.eduattend.entity.MessageEntity;
import com.eduattend.model.ChatMessage;
import com.eduattend.repository.MessageRepository;
import com.eduattend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatService chatService;

    // WebSocket send
    @MessageMapping("/send")
    public void sendMessage(MessageEntity message) {

        messageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/messages",
                message
        );
    }

    // REST: Load history
    @GetMapping("/{classroomId}")
    @ResponseBody
    public List<ChatMessage> getMessages(@PathVariable String classroomId) {
        return chatService.getMessages(classroomId);
    }
}
