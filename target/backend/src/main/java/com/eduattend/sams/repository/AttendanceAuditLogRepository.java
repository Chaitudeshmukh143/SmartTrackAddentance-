package com.eduattend.sams.repository;

import com.eduattend.sams.entity.AttendanceAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceAuditLogRepository extends JpaRepository<AttendanceAuditLog, Long> {
    List<AttendanceAuditLog> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<AttendanceAuditLog> findByAttendanceIdOrderByCreatedAtDesc(UUID attendanceId);
}