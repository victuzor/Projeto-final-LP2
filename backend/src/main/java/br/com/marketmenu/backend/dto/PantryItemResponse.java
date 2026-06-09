package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PantryItemResponse(
        Long id,
        Long productId,
        String productName,
        String categoryName,
        BigDecimal quantity,
        LocalDate expirationDate,
        Long daysToExpire,
        String status
) {
}