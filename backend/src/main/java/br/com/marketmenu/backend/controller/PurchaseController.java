package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.PurchaseRequest;
import br.com.marketmenu.backend.dto.PurchaseResponse;
import br.com.marketmenu.backend.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponse create(@RequestBody @Valid PurchaseRequest request) {
        return purchaseService.create(request);
    }

    @GetMapping
    public List<PurchaseResponse> findAll() {
        return purchaseService.findAll();
    }

    @GetMapping("/{id}")
    public PurchaseResponse findById(@PathVariable Long id) {
        return purchaseService.findById(id);
    }
}