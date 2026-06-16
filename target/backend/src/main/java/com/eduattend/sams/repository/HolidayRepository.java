package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    List<Holiday> findByDate(LocalDate date);

    List<Holiday> findByHolidayType(com.eduattend.sams.enums.HolidayType type);
}