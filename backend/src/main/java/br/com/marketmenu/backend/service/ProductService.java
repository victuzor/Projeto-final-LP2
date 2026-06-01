package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Category;
import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.dto.ProductRequest;
import br.com.marketmenu.backend.dto.ProductResponse;
import br.com.marketmenu.backend.repository.CategoryRepository;
import br.com.marketmenu.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductResponse create(ProductRequest request) {
        Category category = null;

        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        }

        Product product = Product.builder()
                .name(request.name())
                .brand(request.brand())
                .barcode(request.barcode())
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public List<ProductResponse> findAll() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        Long categoryId = product.getCategory() != null
                ? product.getCategory().getId()
                : null;

        String categoryName = product.getCategory() != null
                ? product.getCategory().getName()
                : null;

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getBarcode(),
                categoryId,
                categoryName
        );
    }
}