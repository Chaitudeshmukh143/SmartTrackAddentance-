package com.eduattend.sams.entity;

import com.eduattend.sams.enums.HolidayType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "holidays")
public class Holiday {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HolidayType holidayType;

    @Column(nullable = false)
    private LocalDate date;

    public static Holiday create() {
        Holiday holiday = new Holiday();
        holiday.setId(UUID.randomUUID());
        return holiday;
    }
}