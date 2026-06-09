package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;

public record SmartListItemResponse(
        Long productId,
        String productName,
        String categoryName,
        BigDecimal currentQuantity,
        BigDecimal suggestedQuantity,
        BigDecimal lastUnitPrice,
        String reason
) {
}