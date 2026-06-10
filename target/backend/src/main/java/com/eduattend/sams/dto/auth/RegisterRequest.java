package com.eduattend.sams.dto.auth;

import com.eduattend.sams.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 64) String password,
        @NotNull UserRole role,
        String rollNumber,
        String employeeId,
        @NotBlank String department,
        Integer semester
) {
}
