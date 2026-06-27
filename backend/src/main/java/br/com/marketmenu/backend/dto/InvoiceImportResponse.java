package br.com.marketmenu.backend.dto;

public record InvoiceImportResponse(
        PurchaseResponse purchase,
        int createdProductsCount,
        String message
) {
}