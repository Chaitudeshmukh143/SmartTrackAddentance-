package com.eduattend.sams.service;

import com.eduattend.sams.entity.PasswordResetToken;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.repository.PasswordResetTokenRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JavaMailSender mailSender;

    @Transactional
    public PasswordResetToken generatePasswordResetToken(User user) {
        // Delete any existing unused tokens for this user
        passwordResetTokenRepository.findByTokenContaining(user.getEmail())
                .ifPresent(passwordResetTokenRepository::delete);
        
        PasswordResetToken token = PasswordResetToken.create(user);
        return passwordResetTokenRepository.save(token);
    }

    @Transactional
    public void generateAndSendResetToken(String email) {
        userRepository.findByEmailIgnoreCase(email)
                .ifPresent(user -> {
                    // Generate and send password reset token
                    PasswordResetToken passwordResetToken = generatePasswordResetToken(user);
                    sendPasswordResetEmail(user, passwordResetToken.getToken());
                });
    }

    public boolean validateToken(String token) {
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));
        
        if (passwordResetToken.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }
        
        if (passwordResetToken.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw new IllegalArgumentException("Token has expired");
        }
        
        return true;
    }

    public void validateAndResetPassword(String token, String newPassword) {
        // Validate token
        if (!validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        // Reset password
        resetPassword(token, newPassword);
    }

    public void sendPasswordResetEmail(User user, String token) {
        String subject = "Reset your password";
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String message = "Hello " + user.getFullName() + ",\n\n"
                + "Please click the link below to reset your password:\n"
                + resetUrl + "\n\n"
                + "This link will expire in 1 hour.\n\n"
                + "If you didn't request a password reset, please ignore this email.";
        
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(user.getEmail());
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));
        
        if (passwordResetToken.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }
        
        if (passwordResetToken.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw new IllegalArgumentException("Token has expired");
        }
        
        // Mark token as used
        passwordResetToken.setUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);
        
        // Update user's password
        User user = passwordResetToken.getUser();
        // In a real app, we would encode the password here
        // For now, we'll just set it directly (this should be improved)
        user.setPasswordHash(newPassword);
        userRepository.save(user);
    }
}