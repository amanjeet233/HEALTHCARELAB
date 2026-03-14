package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.SlotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface SlotConfigRepository extends JpaRepository<SlotConfig, Long> {

    List<SlotConfig> findByPincodeAndDayOfWeekAndIsActiveTrueOrderBySlotStart(String pincode, DayOfWeek dayOfWeek);
}
