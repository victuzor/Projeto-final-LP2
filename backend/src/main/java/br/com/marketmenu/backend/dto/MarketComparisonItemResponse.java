package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;

public record MarketComparisonItemResponse(
        Long productId,
        String productName,
        BigDecimal suggestedQuantity,
        BigDecimal unitPrice,
        BigDecimal estimatedTotal,
        boolean priceAvailable
) {
}