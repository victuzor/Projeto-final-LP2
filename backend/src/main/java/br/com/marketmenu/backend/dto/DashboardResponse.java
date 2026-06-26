package br.com.marketmenu.backend.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        String month,
        BigDecimal monthlySpent,
        long purchasesInMonth,
        long pantryItemsCount,
        long expiringSoonCount,
        long expiredItemsCount
) {
}