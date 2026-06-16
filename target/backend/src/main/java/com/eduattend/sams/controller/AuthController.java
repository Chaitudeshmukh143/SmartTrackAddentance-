package com.eduattend.sams.controller;

import com.eduattend.sams.api.ApiResponse;
import com.eduattend.sams.dto.auth.AuthResponse;
import com.eduattend.sams.dto.auth.ForgotPasswordRequest;
import com.eduattend.sams.dto.auth.LoginRequest;
import com.eduattend.sams.dto.auth.RefreshTokenRequest;
import com.eduattend.sams.dto.auth.RegisterRequest;
import com.eduattend.sams.dto.auth.ResetPasswordRequest;
import com.eduattend.sams.service.AuthService;
import com.eduattend.sams.service.PasswordResetService;
import com.eduattend.sams.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationService verificationService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, VerificationService verificationService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.verificationService = verificationService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Registration successful", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refresh(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.generateAndSendResetToken(request.email());
        return ResponseEntity.ok(ApiResponse.success("If the account exists, a reset email will be sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.validateAndResetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(@RequestParam String token) {
        verificationService.verifyToken(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody LoginRequest request) {
        // Find user by email
        var userOptional = authService.getUserRepository().findByEmailIgnoreCase(request.email());
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            if (!user.isEmailVerified()) {
                verificationService.resendVerificationToken(user);
                return ResponseEntity.ok(ApiResponse.success("Verification email resent", null));
            } else {
                throw new BadRequestException("Email is already verified");
            }
        }
        // Don't reveal whether the email exists for security
        return ResponseEntity.ok(ApiResponse.success("If the account exists and is not verified, a verification email has been sent", null));
    }
}
