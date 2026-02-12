
package main.java.com.eduattend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class AttendanceRecord {
    private String studentId;
    private String date;
    private String status; // 'present' or 'absent'
}
