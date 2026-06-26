package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.PantryItemRequest;
import br.com.marketmenu.backend.dto.PantryItemResponse;
import br.com.marketmenu.backend.service.PantryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pantry")
@RequiredArgsConstructor
public class PantryController {

    private final PantryService pantryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PantryItemResponse create(@RequestBody @Valid PantryItemRequest request) {
        return pantryService.create(request);
    }

    @GetMapping
    public List<PantryItemResponse> findAll() {
        return pantryService.findAll();
    }

    @GetMapping("/expiring")
    public List<PantryItemResponse> findExpiringSoon(
            @RequestParam(defaultValue = "7") int days
    ) {
        return pantryService.findExpiringSoon(days);
    }

    @GetMapping("/expired")
    public List<PantryItemResponse> findExpired() {
        return pantryService.findExpired();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteById(@PathVariable Long id) {
        pantryService.deleteById(id);
    }
}