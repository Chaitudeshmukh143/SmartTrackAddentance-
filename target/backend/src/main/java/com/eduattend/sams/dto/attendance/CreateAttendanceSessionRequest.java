package com.eduattend.sams.dto.attendance;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CreateAttendanceSessionRequest(
        @Min(1) @Max(60) Integer expiryMinutes,
        @Min(10) @Max(1000) Integer allowedRadiusMeters,
        Double latitude,
        Double longitude
) {
}
