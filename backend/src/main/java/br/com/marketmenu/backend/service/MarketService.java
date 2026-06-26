package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Market;
import br.com.marketmenu.backend.dto.MarketRequest;
import br.com.marketmenu.backend.dto.MarketResponse;
import br.com.marketmenu.backend.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketRepository marketRepository;

    public MarketResponse create(MarketRequest request) {
        Market market = Market.builder()
                .name(request.name())
                .address(request.address())
                .build();

        Market savedMarket = marketRepository.save(market);

        return toResponse(savedMarket);
    }

    public List<MarketResponse> findAll() {
        return marketRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MarketResponse toResponse(Market market) {
        return new MarketResponse(
                market.getId(),
                market.getName(),
                market.getAddress()
        );
    }
}