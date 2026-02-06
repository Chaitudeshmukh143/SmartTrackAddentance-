
package com.eduattend.service;

import com.eduattend.model.*;
import com.eduattend.repository.ClassroomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClassroomServiceImpl implements ClassroomService {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Override
    public List<ClassroomEntity> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    @Override
    public ClassroomEntity createClassroom(ClassroomEntity classroom) {
        if (classroom.getQrCode() == null) {
            classroom.setQrCode("EDU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return classroomRepository.save(classroom);
    }

    @Override
    public ClassroomEntity getClassroomById(String id) {
        return classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));
    }

    @Override
    public ClassroomEntity updateAttendance(String id, List<AttendanceRecord> records) {
        ClassroomEntity classroom = getClassroomById(id);
        classroom.setAttendance(records);
        return classroomRepository.save(classroom);
    }

    @Override
    public ClassroomEntity addNote(String id, Note note) {
        ClassroomEntity classroom = getClassroomById(id);
        if (classroom.getNotes() == null) {
            classroom.setNotes(new ArrayList<>());
        }
        classroom.getNotes().add(note);
        return classroomRepository.save(classroom);
    }

    @Override
    public ClassroomEntity addStudent(String id, StudentEntity student) {
        ClassroomEntity classroom = getClassroomById(id);
        if (classroom.getStudents() == null) {
            classroom.setStudents(new ArrayList<>());
        }
        
        boolean alreadyEnrolled = classroom.getStudents().stream()
                .anyMatch(s -> s.getId().equals(student.getId()));
        
        if (!alreadyEnrolled) {
            classroom.getStudents().add(student);
        }
        return classroomRepository.save(classroom);
    }
}
