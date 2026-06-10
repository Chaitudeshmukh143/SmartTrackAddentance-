package com.eduattend.sams.dto.auth;

import com.eduattend.sams.enums.UserRole;
import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String fullName,
        String email,
        UserRole role,
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt
) {
}
