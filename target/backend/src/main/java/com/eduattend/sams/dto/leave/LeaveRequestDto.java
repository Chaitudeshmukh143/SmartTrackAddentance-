package com.eduattend.sams.dto.leave;

import com.eduattend.sams.enums.LeaveType;
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
public class LeaveRequestDto {
    private UUID id;
    private UUID studentId;
    private UUID classroomId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private LeaveType leaveType;
    private String reason;
    private String attachmentUrl;
    private RequestStatus status;
}