
package main.java.com.eduattend.controller;

import com.eduattend.model.*;
import com.eduattend.service.ClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    @Autowired
    private ClassroomService classroomService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("database", "CONNECTED");
        return ResponseEntity.ok(status);
    }

    @GetMapping
    public List<ClassroomEntity> getAll() {
        return classroomService.getAllClassrooms();
    }

    @PostMapping
    public ClassroomEntity create(@RequestBody ClassroomEntity classroom) {
        return classroomService.createClassroom(classroom);
    }

    @GetMapping("/{id}")
    public ClassroomEntity getOne(@PathVariable String id) {
        return classroomService.getClassroomById(id);
    }

    @PostMapping("/{id}/attendance")
    public ClassroomEntity updateAttendance(@PathVariable String id, @RequestBody List<AttendanceRecord> records) {
        return classroomService.updateAttendance(id, records);
    }

    @PostMapping("/{id}/notes")
    public ClassroomEntity addNote(@PathVariable String id, @RequestBody Note note) {
        return classroomService.addNote(id, note);
    }

    @PostMapping("/{id}/students")
    public ClassroomEntity addStudent(@PathVariable String id, @RequestBody StudentEntity student) {
        return classroomService.addStudent(id, student);
    }
}
