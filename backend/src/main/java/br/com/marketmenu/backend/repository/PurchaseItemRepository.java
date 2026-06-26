package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.PurchaseItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    long countByProductId(Long productId);

    @Query("""
            SELECT pi.unitPrice
            FROM PurchaseItem pi
            WHERE pi.product.id = :productId
            ORDER BY pi.purchase.purchaseDate DESC, pi.id DESC
            """)
    List<BigDecimal> findLatestPricesByProductId(
            @Param("productId") Long productId,
            Pageable pageable
    );

    @Query("""
            SELECT pi
            FROM PurchaseItem pi
            WHERE pi.product.id = :productId
            AND pi.purchase.market.id = :marketId
            ORDER BY pi.purchase.purchaseDate DESC, pi.id DESC
            """)
    List<PurchaseItem> findLatestByProductIdAndMarketId(
            @Param("productId") Long productId,
            @Param("marketId") Long marketId,
            Pageable pageable
    );
}