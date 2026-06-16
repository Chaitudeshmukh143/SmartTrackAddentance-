package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByClassroomId(Long classroomId);
    Conversation findByIdAndType(Long id, Conversation.ConversationType type);
}