package com.eduattend.sams.service;

import com.eduattend.sams.entity.UserStatus;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.repository.UserStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;
import java.util.Optional;

@Service
public class UserStatusService {

    @Autowired
    private UserStatusRepository userStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Handle WebSocket connection events
    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        // Extract user from session (simplified - in practice you'd get from auth)
        // For now, we'll just log the connection
        System.out.println("WebSocket user connected: " + event.getMessage());
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        // Extract user from session (simplified - in practice you'd get from auth)
        // For now, we'll just log the disconnection
        System.out.println("WebSocket user disconnected: " + event.getMessage());
    }

    // Set user status to online
    public void setUserOnline(Long userId) {
        UserStatus status = userStatusRepository.findByUserId(userId);
        if (status == null) {
            status = new UserStatus();
            status.setUser(userRepository.findById(userId).orElseThrow());
        }
        status.setStatus(UserStatus.StatusType.ONLINE);
        status.setLastSeen(Instant.now());
        userStatusRepository.save(status);
        
        // Broadcast status update
        messagingTemplate.convertAndSend(
                "/topic/user/" + userId + "/status",
                new UserStatusResponse(userId, UserStatus.StatusType.ONLINE, Instant.now())
        );
    }

    // Set user status to offline
    public void setUserOffline(Long userId) {
        UserStatus status = userStatusRepository.findByUserId(userId);
        if (status == null) {
            status = new UserStatus();
            status.setUser(userRepository.findById(userId).orElseThrow());
        }
        status.setStatus(UserStatus.StatusType.OFFLINE);
        status.setLastSeen(Instant.now());
        userStatusRepository.save(status);
        
        // Broadcast status update
        messagingTemplate.convertAndSend(
                "/topic/user/" + userId + "/status",
                new UserStatusResponse(userId, UserStatus.StatusType.OFFLINE, Instant.now())
        );
    }

    // Get user status
    public UserStatusResponse getUserStatus(Long userId) {
        UserStatus status = userStatusRepository.findByUserId(userId);
        if (status == null) {
            return new UserStatusResponse(userId, UserStatus.StatusType.OFFLINE, null);
        }
        return new UserStatusResponse(
                status.getUser().getId(),
                status.getStatus(),
                status.getLastSeen()
        );
    }

    // DTO for status response
    public record UserStatusResponse(
            Long userId,
            UserStatus.StatusType status,
            Instant lastSeen
    ) {}
}