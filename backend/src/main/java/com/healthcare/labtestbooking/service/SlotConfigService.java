package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.repository.SlotConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SlotConfigService {

    private final SlotConfigRepository slotConfigRepository;

    @Transactional
    public SlotConfig saveSlotConfig(SlotConfig config) {
        log.info("Saving slot config for day: {}", config.getDayOfWeek());
        return slotConfigRepository.save(config);
    }

    public Optional<SlotConfig> getConfigByDay(String dayOfWeek) {
        return slotConfigRepository.findByDayOfWeek(dayOfWeek);
    }

    public List<SlotConfig> getAllConfigs() {
        return slotConfigRepository.findAll();
    }
}
