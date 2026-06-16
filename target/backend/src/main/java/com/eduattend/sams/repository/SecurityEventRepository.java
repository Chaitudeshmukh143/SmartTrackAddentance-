package com.eduattend.sams.repository;

import com.eduattend.sams.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SecurityEvent> findByEventTypeOrderByCreatedAtDesc(String eventType);
}