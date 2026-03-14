package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReferenceRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferenceRangeRepository extends JpaRepository<ReferenceRange, Long> {

    List<ReferenceRange> findByParameterId(Long parameterId);
}
