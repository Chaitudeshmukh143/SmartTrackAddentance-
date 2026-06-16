package com.eduattend.sams.repository;

import com.eduattend.sams.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByStudentId(UUID studentId);

    List<LeaveRequest> findByStatus(com.eduattend.sams.enums.RequestStatus status);

    List<LeaveRequest> findByStudentIdAndStatus(UUID studentId, com.eduattend.sams.enums.RequestStatus status);

    List<LeaveRequest> findByFromDate(LocalDate fromDate);

    List<LeaveRequest> findByToDate(LocalDate toDate);
}