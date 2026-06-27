package br.com.marketmenu.backend.service;

import br.com.marketmenu.backend.domain.Market;
import br.com.marketmenu.backend.domain.Product;
import br.com.marketmenu.backend.dto.InvoicePreviewItemResponse;
import br.com.marketmenu.backend.dto.InvoicePreviewResponse;
import br.com.marketmenu.backend.repository.MarketRepository;
import br.com.marketmenu.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoicePreviewService {

    private final MarketRepository marketRepository;
    private final ProductRepository productRepository;

    public InvoicePreviewResponse preview(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Envie uma imagem ou arquivo da nota fiscal");
        }

        Market market = marketRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nenhum mercado cadastrado"));

        List<Product> products = productRepository.findAll();

        if (products.size() < 3) {
            throw new RuntimeException(
                    "São necessários pelo menos três produtos cadastrados para gerar a prévia da nota"
            );
        }

        Product firstProduct = products.get(0);
        Product secondProduct = products.get(1);
        Product thirdProduct = products.get(2);

        List<InvoicePreviewItemResponse> items = List.of(
                new InvoicePreviewItemResponse(
                        firstProduct.getId(),
                        firstProduct.getName(),
                        new BigDecimal("2"),
                        new BigDecimal("6.49"),
                        new BigDecimal("12.98"),
                        "Confirme a validade na embalagem"
                ),
                new InvoicePreviewItemResponse(
                        secondProduct.getId(),
                        secondProduct.getName(),
                        new BigDecimal("1"),
                        new BigDecimal("7.99"),
                        new BigDecimal("7.99"),
                        "Validade longa estimada"
                ),
                new InvoicePreviewItemResponse(
                        thirdProduct.getId(),
                        thirdProduct.getName(),
                        new BigDecimal("1"),
                        new BigDecimal("4.50"),
                        new BigDecimal("4.50"),
                        "Consumir em poucos dias"
                )
        );

        BigDecimal estimatedTotal = items.stream()
                .map(InvoicePreviewItemResponse::totalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new InvoicePreviewResponse(
                file.getOriginalFilename(),
                "PREVIEW_READY",
                "Prévia gerada. Nesta etapa, os itens são simulados para validar o fluxo de importação.",
                market.getId(),
                market.getName(),
                LocalDate.now(),
                estimatedTotal,
                items
        );
    }
}