package com.eduattend.sams.repository;

import com.eduattend.sams.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    List<AttendanceRecord> findBySessionId(UUID sessionId);

    List<AttendanceRecord> findByStudentIdAndAttendanceDate(UUID studentId, LocalDate date);
}