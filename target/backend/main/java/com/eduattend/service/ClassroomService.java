
package main.java.com.eduattend.service;

import com.eduattend.model.*;
import java.util.List;

public interface ClassroomService {
    List<ClassroomEntity> getAllClassrooms();
    ClassroomEntity createClassroom(ClassroomEntity classroom);
    ClassroomEntity getClassroomById(String id);
    ClassroomEntity updateAttendance(String id, List<AttendanceRecord> records);
    ClassroomEntity addNote(String id, Note note);
    ClassroomEntity addStudent(String id, StudentEntity student);
}
