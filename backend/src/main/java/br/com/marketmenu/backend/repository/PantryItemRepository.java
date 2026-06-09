package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;

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
}