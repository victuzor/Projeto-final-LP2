package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {

    List<PantryItem> findAllByOrderByExpirationDateAscCreatedAtDesc();

    Optional<PantryItem> findByProductIdAndExpirationDate(Long productId, LocalDate expirationDate);

    List<PantryItem> findByExpirationDateBetweenOrderByExpirationDateAsc(
            LocalDate startDate,
            LocalDate endDate
    );

    List<PantryItem> findByExpirationDateBeforeOrderByExpirationDateAsc(LocalDate date);

    long countByExpirationDateBetween(LocalDate startDate, LocalDate endDate);

    long countByExpirationDateBefore(LocalDate date);

    @Query("""
        SELECT SUM(p.quantity)
        FROM PantryItem p
        WHERE p.product.id = :productId
        """)
    BigDecimal sumQuantityByProductId(@Param("productId") Long productId);
}