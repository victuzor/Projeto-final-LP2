package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseResponse(
        Long id,
        Long marketId,
        String marketName,
        LocalDate purchaseDate,
        BigDecimal totalAmount,
        List<PurchaseItemResponse> items
) {
}