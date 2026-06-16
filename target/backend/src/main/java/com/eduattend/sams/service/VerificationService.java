package com.eduattend.sams.service;

import com.eduattend.sams.entity.User;
import com.eduattend.sams.entity.VerificationToken;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final JavaMailSender mailSender;

    @Transactional
    public VerificationToken generateVerificationToken(User user) {
        // Delete any existing unused tokens for this user
        verificationTokenRepository.findByUserId(user.getId())
                .ifPresent(verificationTokenRepository::delete);
        
        VerificationToken token = VerificationToken.create(user);
        return verificationTokenRepository.save(token);
    }

    public boolean verifyToken(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
        
        if (verificationToken.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }
        
        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token has expired");
        }
        
        // Mark token as used
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        
        // Mark user as verified
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        return true;
    }

    public void sendVerificationEmail(User user, String token) {
        String subject = "Please verify your email";
        String verificationUrl = "http://localhost:3000/verify?token=" + token;
        String message = "Hello " + user.getFullName() + ",\n\n"
                + "Please click the link below to verify your email address:\n"
                + verificationUrl + "\n\n"
                + "This link will expire in 24 hours.\n\n"
                + "If you didn't create an account, please ignore this email.";
        
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(user.getEmail());
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }

    @Transactional
    public void resendVerificationToken(User user) {
        // Delete any existing unused tokens for this user
        verificationTokenRepository.findByUserId(user.getId())
                .ifPresent(verificationTokenRepository::delete);
        
        VerificationToken token = generateVerificationToken(user);
        sendVerificationEmail(user, token.getToken());
    }
}