package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.dto.InvoiceImportItemRequest;
import br.com.marketmenu.backend.dto.InvoiceImportRequest;
import br.com.marketmenu.backend.dto.InvoiceImportResponse;
import br.com.marketmenu.backend.dto.PurchaseItemRequest;
import br.com.marketmenu.backend.dto.PurchaseRequest;
import br.com.marketmenu.backend.dto.PurchaseResponse;
import br.com.marketmenu.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvoiceImportService {

    private final ProductRepository productRepository;
    private final PurchaseService purchaseService;

    @Transactional
    public InvoiceImportResponse importInvoice(InvoiceImportRequest request) {
        List<PurchaseItemRequest> purchaseItems = new ArrayList<>();
        int createdProductsCount = 0;

        for (InvoiceImportItemRequest item : request.items()) {
            Product product = resolveProduct(item);

            if (item.productId() == null) {
                Optional<Product> existingProduct = findProductByName(item.productName());

                if (existingProduct.isEmpty()) {
                    createdProductsCount++;
                }
            }

            purchaseItems.add(
                    new PurchaseItemRequest(
                            product.getId(),
                            item.quantity(),
                            item.unitPrice(),
                            item.expirationDate()
                    )
            );
        }

        PurchaseResponse purchase = purchaseService.create(
                new PurchaseRequest(
                        request.marketId(),
                        request.purchaseDate(),
                        purchaseItems
                )
        );

        String message = createdProductsCount > 0
                ? "Nota importada com sucesso. "
                + createdProductsCount
                + " novo(s) produto(s) foram adicionados à base."
                : "Nota importada com sucesso.";

        return new InvoiceImportResponse(
                purchase,
                createdProductsCount,
                message
        );
    }

    private Product resolveProduct(InvoiceImportItemRequest item) {
        if (item.productId() != null) {
            return productRepository.findById(item.productId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        }

        return findProductByName(item.productName())
                .orElseGet(() -> createProductFromInvoice(item.productName()));
    }

    private Optional<Product> findProductByName(String productName) {
        String normalizedName = normalizeText(productName);

        return productRepository.findAll()
                .stream()
                .filter(product -> normalizeText(product.getName()).equals(normalizedName))
                .findFirst();
    }

    private Product createProductFromInvoice(String productName) {
        Product product = Product.builder()
                .name(cleanProductName(productName))
                .brand("Importado da nota")
                .barcode(null)
                .category(null)
                .build();

        return productRepository.save(product);
    }

    private String cleanProductName(String productName) {
        return productName
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String normalizeText(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}