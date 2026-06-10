package com.eduattend.sams.repository;

import com.eduattend.sams.entity.AttendanceSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    Optional<AttendanceSession> findByIdAndClassroomTeacherId(UUID id, UUID teacherId);
}
