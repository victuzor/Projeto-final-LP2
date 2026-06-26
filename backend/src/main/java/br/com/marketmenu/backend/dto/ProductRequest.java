package br.com.marketmenu.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProductRequest(
        @NotBlank(message = "O nome do produto é obrigatório")
        String name,

        String brand,

        String barcode,

        Long categoryId
) {
}