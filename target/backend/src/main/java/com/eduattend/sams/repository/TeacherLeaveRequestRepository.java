package com.eduattend.sams.repository;

import com.eduattend.sams.entity.TeacherLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherLeaveRequestRepository extends JpaRepository<TeacherLeaveRequest, UUID> {

    List<TeacherLeaveRequest> findByTeacherId(UUID teacherId);

    List<TeacherLeaveRequest> findByStatus(com.eduattend.sams.enums.RequestStatus status);

    List<TeacherLeaveRequest> findByTeacherIdAndStatus(UUID teacherId, com.eduattend.sams.enums.RequestStatus status);

    List<TeacherLeaveRequest> findByFromDate(LocalDate fromDate);

    List<TeacherLeaveRequest> findByToDate(LocalDate toDate);
}