package com.eduattend.sams.dto.classroom;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateClassroomRequest(
        @NotBlank String className,
        @NotBlank String subjectName,
        @NotNull Integer semester,
        @NotBlank String department,
        @Size(max = 1200) String description
) {
}
