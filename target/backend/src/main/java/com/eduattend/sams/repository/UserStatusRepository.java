package com.eduattend.sams.repository;

import com.eduattend.sams.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, Long> {
    UserStatus findByUserId(Long userId);
}