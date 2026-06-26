package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.DashboardResponse;
import br.com.marketmenu.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/monthly-summary")
    public DashboardResponse getMonthlySummary() {
        return dashboardService.getMonthlySummary();
    }
}