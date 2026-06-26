package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.PantryItem;
import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.dto.PantryItemRequest;
import br.com.marketmenu.backend.dto.PantryItemResponse;
import br.com.marketmenu.backend.repository.PantryItemRepository;
import br.com.marketmenu.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PantryService {

    private final PantryItemRepository pantryItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public PantryItemResponse create(PantryItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        PantryItem pantryItem = pantryItemRepository
                .findByProductIdAndExpirationDate(product.getId(), request.expirationDate())
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity().add(request.quantity()));
                    return existingItem;
                })
                .orElseGet(() -> PantryItem.builder()
                        .product(product)
                        .quantity(request.quantity())
                        .expirationDate(request.expirationDate())
                        .build()
                );

        PantryItem savedItem = pantryItemRepository.save(pantryItem);

        return toResponse(savedItem);
    }

    @Transactional(readOnly = true)
    public List<PantryItemResponse> findAll() {
        return pantryItemRepository.findAllByOrderByExpirationDateAscCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PantryItemResponse> findExpiringSoon(int days) {
        LocalDate today = LocalDate.now();
        LocalDate limitDate = today.plusDays(days);

        return pantryItemRepository
                .findByExpirationDateBetweenOrderByExpirationDateAsc(today, limitDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PantryItemResponse> findExpired() {
        LocalDate today = LocalDate.now();

        return pantryItemRepository
                .findByExpirationDateBeforeOrderByExpirationDateAsc(today)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteById(Long id) {
        if (!pantryItemRepository.existsById(id)) {
            throw new RuntimeException("Item da despensa não encontrado");
        }

        pantryItemRepository.deleteById(id);
    }

    private PantryItemResponse toResponse(PantryItem pantryItem) {
        Product product = pantryItem.getProduct();

        String categoryName = product.getCategory() != null
                ? product.getCategory().getName()
                : null;

        return new PantryItemResponse(
                pantryItem.getId(),
                product.getId(),
                product.getName(),
                categoryName,
                pantryItem.getQuantity(),
                pantryItem.getExpirationDate(),
                calculateDaysToExpire(pantryItem.getExpirationDate()),
                calculateStatus(pantryItem.getExpirationDate())
        );
    }

    private Long calculateDaysToExpire(LocalDate expirationDate) {
        if (expirationDate == null) {
            return null;
        }

        return ChronoUnit.DAYS.between(LocalDate.now(), expirationDate);
    }

    private String calculateStatus(LocalDate expirationDate) {
        if (expirationDate == null) {
            return "SEM_VALIDADE";
        }

        LocalDate today = LocalDate.now();

        if (expirationDate.isBefore(today)) {
            return "VENCIDO";
        }

        if (!expirationDate.isAfter(today.plusDays(7))) {
            return "VENCE_EM_BREVE";
        }

        return "OK";
    }
}