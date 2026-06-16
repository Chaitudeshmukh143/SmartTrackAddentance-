package com.eduattend.sams.repository;

import com.eduattend.sams.entity.AttendanceAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceAuditRepository extends JpaRepository<AttendanceAudit, UUID> {

    List<AttendanceAudit> findBySessionId(UUID sessionId);

    List<AttendanceAudit> findByStudentId(UUID studentId);
}