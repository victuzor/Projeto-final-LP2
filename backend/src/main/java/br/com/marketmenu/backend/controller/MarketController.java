package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.MarketRequest;
import br.com.marketmenu.backend.dto.MarketResponse;
import br.com.marketmenu.backend.service.MarketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarketResponse create(@RequestBody @Valid MarketRequest request) {
        return marketService.create(request);
    }

    @GetMapping
    public List<MarketResponse> findAll() {
        return marketService.findAll();
    }
}