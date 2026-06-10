package com.eduattend.sams.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "classrooms")
public class Classroom extends BaseEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String className;

    @Column(nullable = false)
    private String subjectName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(length = 1200)
    private String description;

    @Column(nullable = false, unique = true)
    private String joinCode;

    @Column(nullable = false)
    private boolean archived;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    public static Classroom create() {
        Classroom classroom = new Classroom();
        classroom.setId(UUID.randomUUID());
        return classroom;
    }
}
