package com.eduattend.listener;

import com.eduattend.sams.service.UserStatusService;
import com.eduattend.sams.entity.User;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final UserStatusService userStatusService;

    public WebSocketEventListener(UserStatusService userStatusService) {
        this.userStatusService = userStatusService;
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        // Extract user from session (simplified)
        // In a real implementation, you would get the user from the session attributes
        // or authentication principal
        System.out.println("User connected");
        
        // For demonstration, we'll set a default user as online
        // TODO: Implement proper user extraction from session
        // userStatusService.setUserOnline(1L);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        // Extract user from session (simplified)
        System.out.println("User disconnected");
        
        // For demonstration, we'll set a default user as offline
        // TODO: Implement proper user extraction from session
        // userStatusService.setUserOffline(1L);
    }
}