package com.eduattend.sams.repository;

import com.eduattend.sams.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    java.util.List<MessageAttachment> findByMessageId(Long messageId);
}