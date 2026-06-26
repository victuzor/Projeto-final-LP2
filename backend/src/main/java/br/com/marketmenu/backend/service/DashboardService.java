package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.dto.DashboardResponse;
import br.com.marketmenu.backend.repository.PantryItemRepository;
import br.com.marketmenu.backend.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PurchaseRepository purchaseRepository;
    private final PantryItemRepository pantryItemRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getMonthlySummary() {
        LocalDate today = LocalDate.now();

        YearMonth currentMonth = YearMonth.from(today);
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        BigDecimal monthlySpent = purchaseRepository
                .sumTotalAmountByPurchaseDateBetween(startDate, endDate);

        long purchasesInMonth = purchaseRepository
                .countByPurchaseDateBetween(startDate, endDate);

        long pantryItemsCount = pantryItemRepository.count();

        long expiringSoonCount = pantryItemRepository
                .countByExpirationDateBetween(today, today.plusDays(7));

        long expiredItemsCount = pantryItemRepository
                .countByExpirationDateBefore(today);

        return new DashboardResponse(
                currentMonth.toString(),
                monthlySpent,
                purchasesInMonth,
                pantryItemsCount,
                expiringSoonCount,
                expiredItemsCount
        );
    }
}