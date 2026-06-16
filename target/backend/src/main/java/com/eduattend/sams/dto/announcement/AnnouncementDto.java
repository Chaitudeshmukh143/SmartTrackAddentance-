package com.eduattend.sams.dto.announcement;

import com.eduattend.sams.entity.Classroom;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDto {
    private UUID id;
    private UUID teacherId;
    private UUID classroomId;
    private String title;
    private String message;
    private String attachmentUrl;
    private Instant publishDate;
}