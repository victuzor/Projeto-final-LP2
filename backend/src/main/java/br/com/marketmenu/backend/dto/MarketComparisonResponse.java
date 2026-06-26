package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record MarketComparisonResponse(
        Long marketId,
        String marketName,
        BigDecimal estimatedTotal,
        int availableItems,
        int missingItems,
        List<MarketComparisonItemResponse> items
) {
}