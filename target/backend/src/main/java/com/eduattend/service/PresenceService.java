package com.eduattend.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    public void userConnected(String userId) {
        onlineUsers.add(userId);
    }

    public void userDisconnected(String userId) {
        onlineUsers.remove(userId);
    }

    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }
}
