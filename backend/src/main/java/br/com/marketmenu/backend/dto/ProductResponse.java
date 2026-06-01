package br.com.marketmenu.backend.dto;

public record ProductResponse(
        Long id,
        String name,
        String brand,
        String barcode,
        Long categoryId,
        String categoryName
) {
}