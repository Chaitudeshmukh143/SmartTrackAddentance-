package com.eduattend.sams.entity;

import com.eduattend.sams.enums.RequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "attendance_regularization_requests")
public class AttendanceRegularizationRequest extends BaseEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false, length = 1200)
    private String reason;

    private String subjectName;

    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    public static AttendanceRegularizationRequest create() {
        AttendanceRegularizationRequest request = new AttendanceRegularizationRequest();
        request.setId(UUID.randomUUID());
        request.setStatus(RequestStatus.PENDING);
        return request;
    }
}
