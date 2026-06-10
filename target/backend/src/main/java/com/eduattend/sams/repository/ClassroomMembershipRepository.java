package com.eduattend.sams.repository;

import com.eduattend.sams.entity.ClassroomMembership;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomMembershipRepository extends JpaRepository<ClassroomMembership, UUID> {
    List<ClassroomMembership> findByStudentId(UUID studentId);
    Optional<ClassroomMembership> findByClassroomIdAndStudentId(UUID classroomId, UUID studentId);
}
