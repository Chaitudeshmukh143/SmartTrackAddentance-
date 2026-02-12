package main.java.com.eduattend.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class StudentEntity {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String joinDate;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
}