package com.eduattend.sams.dto.teacherleave;

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
public class TeacherLeaveRequestDto {
    private UUID id;
    private UUID teacherId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
    private RequestStatus status;
}