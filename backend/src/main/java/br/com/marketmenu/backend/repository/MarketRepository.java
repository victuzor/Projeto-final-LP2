package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.Market;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRepository extends JpaRepository<Market, Long> {
}