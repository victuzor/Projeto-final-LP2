package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoicePreviewResponse(
        String originalFileName,
        String processingStatus,
        String message,
        Long marketId,
        String marketName,
        LocalDate purchaseDate,
        BigDecimal estimatedTotal,
        List<InvoicePreviewItemResponse> items
) {
}