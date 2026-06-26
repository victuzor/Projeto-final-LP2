package br.com.marketmenu.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record MarketRequest(
        @NotBlank(message = "O nome do mercado é obrigatório")
        String name,

        String address
) {
}