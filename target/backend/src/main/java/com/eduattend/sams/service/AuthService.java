package com.eduattend.sams.service;

import com.eduattend.sams.config.AppProperties;
import com.eduattend.sams.dto.auth.AuthResponse;
import com.eduattend.sams.dto.auth.ForgotPasswordRequest;
import com.eduattend.sams.dto.auth.LoginRequest;
import com.eduattend.sams.dto.auth.RefreshTokenRequest;
import com.eduattend.sams.dto.auth.RegisterRequest;
import com.eduattend.sams.dto.auth.ResetPasswordRequest;
import com.eduattend.sams.entity.RefreshToken;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.UserRole;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.RefreshTokenRepository;
import com.eduattend.sams.repository.UserRepository;
import com.eduattend.sams.security.JwtService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AppProperties appProperties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.appProperties = appProperties;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateRegistration(request);

        User user = User.newUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setRollNumber(request.role() == UserRole.STUDENT ? request.rollNumber() : null);
        user.setEmployeeId(request.role() == UserRole.TEACHER ? request.employeeId() : null);
        user.setDepartment(request.department());
        user.setSemester(request.role() == UserRole.STUDENT ? request.semester() : null);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        return issueTokens(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        user.setLastLoginAt(Instant.now());
        return issueTokens(userRepository.save(user));
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token is invalid"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now()) || !jwtService.isTokenValid(refreshToken.getToken())) {
            refreshToken.setRevoked(true);
            throw new BadRequestException("Refresh token has expired");
        }

        return issueTokens(refreshToken.getUser());
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(user -> {
                    // Placeholder for mail workflow and token persistence in the next pass.
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        throw new BadRequestException("Reset password token flow is not wired yet in this backend phase");
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private void validateRegistration(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        if (request.role() == UserRole.STUDENT) {
            if (request.rollNumber() == null || request.rollNumber().isBlank()) {
                throw new BadRequestException("Roll number is required for students");
            }
            if (request.semester() == null) {
                throw new BadRequestException("Semester is required for students");
            }
            if (userRepository.existsByRollNumber(request.rollNumber())) {
                throw new BadRequestException("Roll number is already registered");
            }
        }
        if (request.role() == UserRole.TEACHER) {
            if (request.employeeId() == null || request.employeeId().isBlank()) {
                throw new BadRequestException("Employee ID is required for teachers");
            }
            if (userRepository.existsByEmployeeId(request.employeeId())) {
                throw new BadRequestException("Employee ID is already registered");
            }
        }
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.create();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(Instant.now().plus(appProperties.getSecurity().getJwt().getRefreshTokenExpirationDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                refreshTokenValue,
                jwtService.getAccessTokenExpiry()
        );
    }
}
