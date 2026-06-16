package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    @Modifying
    @Query("UPDATE Message m SET m.content = :content WHERE m.id = :id")
    int updateContent(@Param("id") UUID id, @Param("content") String content);
}