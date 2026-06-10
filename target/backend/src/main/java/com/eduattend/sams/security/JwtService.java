package com.eduattend.sams.security;

import com.eduattend.sams.config.AppProperties;
import com.eduattend.sams.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final AppProperties appProperties;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generateAccessToken(User user) {
        Instant expiresAt = Instant.now().plus(appProperties.getSecurity().getJwt().getAccessTokenExpirationMinutes(), ChronoUnit.MINUTES);
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(Date.from(expiresAt))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant expiresAt = Instant.now().plus(appProperties.getSecurity().getJwt().getRefreshTokenExpirationDays(), ChronoUnit.DAYS);
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(Date.from(expiresAt))
                .signWith(getSigningKey())
                .compact();
    }

    public Instant getAccessTokenExpiry() {
        return Instant.now().plus(appProperties.getSecurity().getJwt().getAccessTokenExpirationMinutes(), ChronoUnit.MINUTES);
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).get("uid", String.class));
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(java.util.Base64.getEncoder()
                .encodeToString(appProperties.getSecurity().getJwt().getSecret().getBytes()));
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
