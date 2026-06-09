package br.com.marketmenu.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record PurchaseRequest(
        @NotNull(message = "O mercado é obrigatório")
        Long marketId,

        @NotNull(message = "A data da compra é obrigatória")
        LocalDate purchaseDate,

        @NotEmpty(message = "A compra precisa ter pelo menos um item")
        List<@Valid PurchaseItemRequest> items
) {
}