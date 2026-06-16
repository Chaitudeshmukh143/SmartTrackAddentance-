package com.eduattend.sams.repository;

import com.eduattend.sams.entity.MessageReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageReadStatusRepository extends JpaRepository<MessageReadStatus, Long> {
    List<MessageReadStatus> findByMessageId(Long messageId);
    List<MessageReadStatus> findByUserIdAndMessageId(Long userId, Long messageId);
}