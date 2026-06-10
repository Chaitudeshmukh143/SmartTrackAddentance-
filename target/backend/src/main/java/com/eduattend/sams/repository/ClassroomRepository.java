package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Classroom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {
    List<Classroom> findByTeacherIdAndArchivedFalse(UUID teacherId);
    Optional<Classroom> findByJoinCode(String joinCode);
}
