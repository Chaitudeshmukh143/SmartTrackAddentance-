package com.eduattend.sams.dto.attendance;

import com.eduattend.sams.enums.RequestStatus;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRegularizationRequestDto {
    private UUID id;
    private UUID studentId;
    private UUID classroomId;
    private LocalDate attendanceDate;
    private String reason;
    private String subjectName;
    private String attachmentUrl;
    private RequestStatus status;
}