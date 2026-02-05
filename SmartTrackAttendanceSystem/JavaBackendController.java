
/**
 * SMARTTRACK JAVA BACKEND - UPDATED WITH USER REGISTRATION
 */

/*
package com.smarttrack.attendance;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// --- UPDATED USER ENTITY ---

@Entity
@Table(name = "USERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "USER_SEQ", allocationSize = 1)
    private Long id;
    
    @Column(unique = true)
    private String email;
    
    private String name;
    private String password; // In production, use BCryptPasswordEncoder
    private String role; // TEACHER, STUDENT
    
    @Column(name = "STUDENT_ID")
    private String studentId;
}

// --- PERSISTENCE ---

interface UserRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByStudentId(String studentId);
}

// --- AUTH CONTROLLER ---

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/register")
    public UserAccount register(@RequestBody UserAccount user) {
        // Here you would hash the password before saving
        return userRepo.save(user);
    }

    @PostMapping("/login")
    public UserAccount login(@RequestBody LoginRequest req) {
        Optional<UserAccount> user = userRepo.findByEmail(req.getIdentifier());
        if (user.isEmpty()) {
            user = userRepo.findByStudentId(req.getIdentifier());
        }
        
        return user.filter(u -> u.getRole().equals(req.getRole()))
                   .orElseThrow(() -> new RuntimeException("Unauthorized"));
    }
}

@Data
class LoginRequest {
    private String identifier;
    private String role;
}
*/
