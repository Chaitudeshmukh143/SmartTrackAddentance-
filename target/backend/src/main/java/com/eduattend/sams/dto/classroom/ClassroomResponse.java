package com.eduattend.sams.dto.classroom;

import java.time.Instant;
import java.util.UUID;

public record ClassroomResponse(
        UUID id,
        String className,
        String subjectName,
        Integer semester,
        String department,
        String description,
        String joinCode,
        boolean archived,
        UUID teacherId,
        String teacherName,
        Instant createdAt
) {
}
