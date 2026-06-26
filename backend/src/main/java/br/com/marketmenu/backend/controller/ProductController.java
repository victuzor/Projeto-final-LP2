package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.ProductRequest;
import br.com.marketmenu.backend.dto.ProductResponse;
import br.com.marketmenu.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@RequestBody @Valid ProductRequest request) {
        return productService.create(request);
    }

    @GetMapping
    public List<ProductResponse> findAll() {
        return productService.findAll();
    }
}