package com.eduattend.sams.repository;

import com.eduattend.sams.entity.AttendanceRegularizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRegularizationRequestRepository extends JpaRepository<AttendanceRegularizationRequest, UUID> {

    List<AttendanceRegularizationRequest> findByStudentId(UUID studentId);

    List<AttendanceRegularizationRequest> findByStatus(com.eduattend.sams.enums.RequestStatus status);

    List<AttendanceRegularizationRequest> findByStudentIdAndStatus(UUID studentId, com.eduattend.sams.enums.RequestStatus status);

    List<AttendanceRegularizationRequest> findByAttendanceDate(LocalDate date);
}