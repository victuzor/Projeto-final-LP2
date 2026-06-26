package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.MarketComparisonResponse;
import br.com.marketmenu.backend.dto.SmartListItemResponse;
import br.com.marketmenu.backend.service.SmartListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/smart-list")
@RequiredArgsConstructor
public class SmartListController {

    private final SmartListService smartListService;

    @GetMapping
    public List<SmartListItemResponse> generateSmartList() {
        return smartListService.generateSmartList();
    }

    @GetMapping("/market-comparison")
    public List<MarketComparisonResponse> compareMarkets() {
        return smartListService.compareMarkets();
    }
}