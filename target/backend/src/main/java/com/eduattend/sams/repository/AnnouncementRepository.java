package com.eduattend.sams.repository;

import com.eduattend.sams.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    List<Announcement> findByTeacherId(UUID teacherId);

    List<Announcement> findByClassroomId(UUID classroomId);

    List<Announcement> findByPublishDateAfter(Instant date);
}