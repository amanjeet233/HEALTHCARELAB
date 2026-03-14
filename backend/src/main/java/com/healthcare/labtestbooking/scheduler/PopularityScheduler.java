package com.healthcare.labtestbooking.scheduler;

import com.healthcare.labtestbooking.service.PopularityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PopularityScheduler {

    private static final int DEFAULT_LIMIT = 50;

    private final PopularityService popularityService;

    @Scheduled(cron = "0 0 3 ? * MON")
    public void refreshPopularityCache() {
        log.info("Refreshing weekly popularity cache");
        popularityService.refreshPopularCache(DEFAULT_LIMIT);
    }
}
