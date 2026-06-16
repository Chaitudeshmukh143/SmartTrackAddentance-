package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Notification;
import com.eduattend.sams.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(UUID userId);
    
    List<Notification> findByUserIdAndType(UUID userId, NotificationType type);
    
    // New methods for filtering
    List<Notification> findByUserIdAndNotificationType(UUID userId, NotificationType type);
    
    List<Notification> findByUserIdAndReadFalseAndNotificationType(UUID userId, NotificationType type);
    
    // Count methods
    long countByUserIdAndReadFalse(UUID userId);
    
    long countByUserIdAndNotificationType(UUID userId, NotificationType type);
    
    // Bulk update methods
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    int markAllAsReadByUserId(@Param("userId") UUID userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :notificationId")
    int markAsReadById(@Param("notificationId") UUID notificationId);
}