package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findAllByOrderByPurchaseDateDesc();

    long countByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT COALESCE(SUM(p.totalAmount), 0)
            FROM Purchase p
            WHERE p.purchaseDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumTotalAmountByPurchaseDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}