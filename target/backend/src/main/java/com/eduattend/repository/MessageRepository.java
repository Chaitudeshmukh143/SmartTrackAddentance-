package com.eduattend.repository;

import com.eduattend.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, String> {

    List<MessageEntity> findByClassroomId(String classroomId);
}
