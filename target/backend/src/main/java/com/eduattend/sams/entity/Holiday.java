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
public class Holiday extends BaseEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HolidayType type;

    @Column(nullable = false)
    private LocalDate holidayDate;

    @Column(nullable = false)
    private boolean recurring;

    public static Holiday create() {
        Holiday holiday = new Holiday();
        holiday.setId(UUID.randomUUID());
        return holiday;
    }
}
