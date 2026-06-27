package br.com.marketmenu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceImportItemRequest(
        Long productId,

        @NotBlank(message = "O nome do produto é obrigatório")
        String productName,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        BigDecimal quantity,

        @NotNull(message = "O preço unitário é obrigatório")
        @Positive(message = "O preço unitário deve ser maior que zero")
        BigDecimal unitPrice,

        LocalDate expirationDate
) {
}