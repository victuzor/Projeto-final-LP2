package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Market;
import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.domain.PurchaseItem;
import br.com.marketmenu.backend.dto.MarketComparisonItemResponse;
import br.com.marketmenu.backend.dto.MarketComparisonResponse;
import br.com.marketmenu.backend.dto.SmartListItemResponse;
import br.com.marketmenu.backend.repository.MarketRepository;
import br.com.marketmenu.backend.repository.PantryItemRepository;
import br.com.marketmenu.backend.repository.ProductRepository;
import br.com.marketmenu.backend.repository.PurchaseItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SmartListService {

    private static final BigDecimal LOW_STOCK_LIMIT = BigDecimal.ONE;
    private static final BigDecimal DEFAULT_SUGGESTED_QUANTITY = BigDecimal.ONE;

    private final ProductRepository productRepository;
    private final PantryItemRepository pantryItemRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final MarketRepository marketRepository;

    @Transactional(readOnly = true)
    public List<SmartListItemResponse> generateSmartList() {
        return productRepository.findAll()
                .stream()
                .map(this::buildSmartListItemIfNeeded)
                .flatMap(Optional::stream)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MarketComparisonResponse> compareMarkets() {
        List<SmartListItemResponse> smartList = generateSmartList();

        return marketRepository.findAll()
                .stream()
                .map(market -> buildMarketComparison(market, smartList))
                .filter(comparison -> comparison.availableItems() > 0)
                .sorted(Comparator.comparing(MarketComparisonResponse::estimatedTotal))
                .toList();
    }

    private Optional<SmartListItemResponse> buildSmartListItemIfNeeded(Product product) {
        long purchaseFrequency = purchaseItemRepository.countByProductId(product.getId());

        if (purchaseFrequency == 0) {
            return Optional.empty();
        }

        BigDecimal currentQuantity = pantryItemRepository.sumQuantityByProductId(product.getId());

        if (currentQuantity == null) {
            currentQuantity = BigDecimal.ZERO;
        }

        if (currentQuantity.compareTo(LOW_STOCK_LIMIT) > 0) {
            return Optional.empty();
        }

        BigDecimal lastUnitPrice = findLatestPrice(product.getId());

        String categoryName = product.getCategory() != null
                ? product.getCategory().getName()
                : null;

        String reason = currentQuantity.compareTo(BigDecimal.ZERO) == 0
                ? "Produto recorrente sem estoque na despensa"
                : "Produto com estoque baixo na despensa";

        return Optional.of(new SmartListItemResponse(
                product.getId(),
                product.getName(),
                categoryName,
                currentQuantity,
                DEFAULT_SUGGESTED_QUANTITY,
                lastUnitPrice,
                reason
        ));
    }

    private BigDecimal findLatestPrice(Long productId) {
        return purchaseItemRepository
                .findLatestPricesByProductId(productId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);
    }

    private MarketComparisonResponse buildMarketComparison(
            Market market,
            List<SmartListItemResponse> smartList
    ) {
        List<MarketComparisonItemResponse> items = smartList
                .stream()
                .map(item -> buildMarketComparisonItem(market, item))
                .toList();

        BigDecimal estimatedTotal = items.stream()
                .filter(MarketComparisonItemResponse::priceAvailable)
                .map(MarketComparisonItemResponse::estimatedTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int availableItems = (int) items.stream()
                .filter(MarketComparisonItemResponse::priceAvailable)
                .count();

        int missingItems = items.size() - availableItems;

        return new MarketComparisonResponse(
                market.getId(),
                market.getName(),
                estimatedTotal,
                availableItems,
                missingItems,
                items
        );
    }

    private MarketComparisonItemResponse buildMarketComparisonItem(
            Market market,
            SmartListItemResponse item
    ) {
        PurchaseItem latestItem = purchaseItemRepository
                .findLatestByProductIdAndMarketId(
                        item.productId(),
                        market.getId(),
                        PageRequest.of(0, 1)
                )
                .stream()
                .findFirst()
                .orElse(null);

        if (latestItem == null) {
            return new MarketComparisonItemResponse(
                    item.productId(),
                    item.productName(),
                    item.suggestedQuantity(),
                    null,
                    BigDecimal.ZERO,
                    false
            );
        }

        BigDecimal estimatedTotal = item.suggestedQuantity()
                .multiply(latestItem.getUnitPrice());

        return new MarketComparisonItemResponse(
                item.productId(),
                item.productName(),
                item.suggestedQuantity(),
                latestItem.getUnitPrice(),
                estimatedTotal,
                true
        );
    }
}