package com.eduattend.service;



import com.eduattend.model.ChatMessage;
import com.eduattend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository repo;

    public List<ChatMessage> getMessages(String classroomId) {
        return repo.findByClassroomId(classroomId);
    }

    public ChatMessage save(ChatMessage msg) {
        return repo.save(msg);
    }
}
