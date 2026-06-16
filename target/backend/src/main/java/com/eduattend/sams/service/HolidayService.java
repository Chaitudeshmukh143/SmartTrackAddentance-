package com.eduattend.sams.service;

import com.eduattend.sams.entity.Holiday;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.HolidayType;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.repository.HolidayRepository;
import com.eduattend.sams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final UserRepository userRepository;

    @Transactional
    public Holiday createHoliday(UUID userId, Holiday holiday) {
        // Verify the user exists and is either a teacher or admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can create holidays");
        }

        // Set the ID and save
        holiday.setId(UUID.randomUUID());
        return holidayRepository.save(holiday);
    }

    @Transactional
    public Holiday updateHoliday(UUID holidayId, UUID userId, Holiday holidayDetails) {
        // Verify the user exists and is either a teacher or admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can update holidays");
        }

        Holiday holiday = holidayRepository.findById(holidayId)
                .orElseThrow(() -> new BadRequestException("Holiday not found"));

        // Update the holiday with the new details
        holiday.setTitle(holidayDetails.getTitle());
        holiday.setDescription(holidayDetails.getDescription());
        holiday.setHolidayType(holidayDetails.getHolidayType());
        holiday.setDate(holidayDetails.getDate());

        return holidayRepository.save(holiday);
    }

    @Transactional
    public void deleteHoliday(UUID holidayId, UUID userId) {
        // Verify the user exists and is either a teacher or admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.getRole().name().equals("TEACHER") && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only teachers and admins can delete holidays");
        }

        Holiday holiday = holidayRepository.findById(holidayId)
                .orElseThrow(() -> new BadRequestException("Holiday not found"));
        holidayRepository.delete(holiday);
    }

    public Holiday getHolidayById(UUID holidayId) {
        return holidayRepository.findById(holidayId)
                .orElseThrow(() -> new BadRequestException("Holiday not found"));
    }

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public List<Holiday> getHolidaysByDate(LocalDate date) {
        return holidayRepository.findByDate(date);
    }

    public List<Holiday> getHolidaysByType(HolidayType type) {
        return holidayRepository.findByHolidayType(type);
    }
}