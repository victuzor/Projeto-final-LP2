package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Market;
import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.domain.Purchase;
import br.com.marketmenu.backend.domain.PurchaseItem;
import br.com.marketmenu.backend.dto.PurchaseItemResponse;
import br.com.marketmenu.backend.dto.PurchaseRequest;
import br.com.marketmenu.backend.dto.PurchaseResponse;
import br.com.marketmenu.backend.repository.MarketRepository;
import br.com.marketmenu.backend.repository.ProductRepository;
import br.com.marketmenu.backend.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final MarketRepository marketRepository;
    private final ProductRepository productRepository;

    public PurchaseResponse create(PurchaseRequest request) {
        Market market = marketRepository.findById(request.marketId())
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        Purchase purchase = Purchase.builder()
                .market(market)
                .purchaseDate(request.purchaseDate())
                .totalAmount(BigDecimal.ZERO)
                .build();

        request.items().forEach(itemRequest -> {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            BigDecimal totalPrice = itemRequest.quantity().multiply(itemRequest.unitPrice());

            PurchaseItem item = PurchaseItem.builder()
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(itemRequest.unitPrice())
                    .totalPrice(totalPrice)
                    .build();

            purchase.addItem(item);
        });

        BigDecimal totalAmount = purchase.getItems()
                .stream()
                .map(PurchaseItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        purchase.setTotalAmount(totalAmount);

        Purchase savedPurchase = purchaseRepository.save(purchase);

        return toResponse(savedPurchase);
    }

    public List<PurchaseResponse> findAll() {
        return purchaseRepository.findAllByOrderByPurchaseDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PurchaseResponse findById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));

        return toResponse(purchase);
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        List<PurchaseItemResponse> items = purchase.getItems()
                .stream()
                .map(item -> new PurchaseItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .toList();

        return new PurchaseResponse(
                purchase.getId(),
                purchase.getMarket().getId(),
                purchase.getMarket().getName(),
                purchase.getPurchaseDate(),
                purchase.getTotalAmount(),
                items
        );
    }
}