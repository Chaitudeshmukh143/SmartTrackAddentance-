package com.eduattend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "classrooms")
@Data
public class ClassroomEntity {
    @Id
    private String id;
    private String name;
    private String subject;
    private String teacherId;
    private String qrCode;

    @ElementCollection
    @CollectionTable(name = "classroom_students", joinColumns = @JoinColumn(name = "classroom_id"))
    private List<StudentEntity> students = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "classroom_attendance", joinColumns = @JoinColumn(name = "classroom_id"))
    private List<AttendanceRecord> attendance = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "classroom_notes", joinColumns = @JoinColumn(name = "classroom_id"))
    private List<Note> notes = new ArrayList<>();
}