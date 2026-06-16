package com.eduattend.sams.repository;

import com.eduattend.sams.entity.DeviceFingerprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceFingerprintRepository extends JpaRepository<DeviceFingerprint, Long> {
    DeviceFingerprint findByUserIdAndDeviceHash(Long userId, String deviceHash);
    DeviceFingerprint findByDeviceHash(String deviceHash);
}