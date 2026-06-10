package com.eduattend.sams.service;

import com.eduattend.sams.dto.attendance.CreateAttendanceSessionRequest;
import com.eduattend.sams.dto.classroom.ClassroomResponse;
import com.eduattend.sams.dto.classroom.CreateClassroomRequest;
import com.eduattend.sams.dto.classroom.UpdateClassroomRequest;
import com.eduattend.sams.entity.AttendanceSession;
import com.eduattend.sams.entity.Classroom;
import com.eduattend.sams.entity.ClassroomMembership;
import com.eduattend.sams.entity.User;
import com.eduattend.sams.enums.UserRole;
import com.eduattend.sams.exception.BadRequestException;
import com.eduattend.sams.exception.ResourceNotFoundException;
import com.eduattend.sams.repository.AttendanceSessionRepository;
import com.eduattend.sams.repository.ClassroomMembershipRepository;
import com.eduattend.sams.repository.ClassroomRepository;
import com.eduattend.sams.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassroomManagementService {

    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;

    public ClassroomManagementService(
            ClassroomRepository classroomRepository,
            ClassroomMembershipRepository membershipRepository,
            UserRepository userRepository,
            AttendanceSessionRepository attendanceSessionRepository
    ) {
        this.classroomRepository = classroomRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.attendanceSessionRepository = attendanceSessionRepository;
    }

    @Transactional
    public ClassroomResponse createClassroom(UUID teacherId, CreateClassroomRequest request) {
        User teacher = getTeacher(teacherId);
        Classroom classroom = Classroom.create();
        classroom.setClassName(request.className());
        classroom.setSubjectName(request.subjectName());
        classroom.setSemester(request.semester());
        classroom.setDepartment(request.department());
        classroom.setDescription(request.description());
        classroom.setTeacher(teacher);
        classroom.setJoinCode("JOIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return toResponse(classroomRepository.save(classroom));
    }

    @Transactional(readOnly = true)
    public List<ClassroomResponse> getTeacherClassrooms(UUID teacherId) {
        getTeacher(teacherId);
        return classroomRepository.findByTeacherIdAndArchivedFalse(teacherId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ClassroomResponse updateClassroom(UUID teacherId, UUID classroomId, UpdateClassroomRequest request) {
        Classroom classroom = getOwnedClassroom(teacherId, classroomId);
        classroom.setClassName(request.className());
        classroom.setSubjectName(request.subjectName());
        classroom.setSemester(request.semester());
        classroom.setDepartment(request.department());
        classroom.setDescription(request.description());
        return toResponse(classroomRepository.save(classroom));
    }

    @Transactional
    public void archiveClassroom(UUID teacherId, UUID classroomId) {
        Classroom classroom = getOwnedClassroom(teacherId, classroomId);
        classroom.setArchived(true);
        classroomRepository.save(classroom);
    }

    @Transactional
    public void deleteClassroom(UUID teacherId, UUID classroomId) {
        Classroom classroom = getOwnedClassroom(teacherId, classroomId);
        classroomRepository.delete(classroom);
    }

    @Transactional
    public ClassroomResponse joinClassroom(UUID studentId, String joinCode) {
        User student = userRepository.findById(studentId)
                .filter(user -> user.getRole() == UserRole.STUDENT)
                .orElseThrow(() -> new BadRequestException("Only students can join classrooms"));
        Classroom classroom = classroomRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        membershipRepository.findByClassroomIdAndStudentId(classroom.getId(), studentId)
                .ifPresent(membership -> {
                    throw new BadRequestException("Student is already enrolled in this classroom");
                });

        ClassroomMembership membership = ClassroomMembership.create();
        membership.setClassroom(classroom);
        membership.setStudent(student);
        membershipRepository.save(membership);
        return toResponse(classroom);
    }

    @Transactional
    public AttendanceSession createAttendanceSession(UUID teacherId, UUID classroomId, CreateAttendanceSessionRequest request, int defaultExpiry, int defaultRadius) {
        Classroom classroom = getOwnedClassroom(teacherId, classroomId);
        AttendanceSession session = AttendanceSession.create();
        session.setClassroom(classroom);
        session.setAttendanceDate(LocalDate.now());
        session.setStartTime(Instant.now());
        session.setExpiresAt(Instant.now().plus(request.expiryMinutes() == null ? defaultExpiry : request.expiryMinutes(), ChronoUnit.MINUTES));
        session.setAllowedRadiusMeters(request.allowedRadiusMeters() == null ? defaultRadius : request.allowedRadiusMeters());
        session.setLatitude(request.latitude());
        session.setLongitude(request.longitude());
        return attendanceSessionRepository.save(session);
    }

    private User getTeacher(UUID teacherId) {
        return userRepository.findById(teacherId)
                .filter(user -> user.getRole() == UserRole.TEACHER)
                .orElseThrow(() -> new BadRequestException("Teacher account not found"));
    }

    private Classroom getOwnedClassroom(UUID teacherId, UUID classroomId) {
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher().getId().equals(teacherId))
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
    }

    private ClassroomResponse toResponse(Classroom classroom) {
        return new ClassroomResponse(
                classroom.getId(),
                classroom.getClassName(),
                classroom.getSubjectName(),
                classroom.getSemester(),
                classroom.getDepartment(),
                classroom.getDescription(),
                classroom.getJoinCode(),
                classroom.isArchived(),
                classroom.getTeacher().getId(),
                classroom.getTeacher().getFullName(),
                classroom.getCreatedAt()
        );
    }
}
