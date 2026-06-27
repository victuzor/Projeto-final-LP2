package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;

public record InvoicePreviewItemResponse(
        Long productId,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        String expirationSuggestion
) {
}