package com.eduattend.sams.entity;

import com.eduattend.sams.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(unique = true)
    private String rollNumber;

    @Column(unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String department;

    private Integer semester;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = false)
    private boolean active = true;

    private Instant lastLoginAt;

    public static User newUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        return user;
    }
}
