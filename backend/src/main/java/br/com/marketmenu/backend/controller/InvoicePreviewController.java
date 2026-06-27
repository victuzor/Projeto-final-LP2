package br.com.marketmenu.backend.controller;

import br.com.marketmenu.backend.dto.InvoiceImportRequest;
import br.com.marketmenu.backend.dto.InvoiceImportResponse;
import br.com.marketmenu.backend.dto.InvoicePreviewResponse;
import br.com.marketmenu.backend.service.InvoiceImportService;
import br.com.marketmenu.backend.service.InvoicePreviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoicePreviewController {

    private final InvoicePreviewService invoicePreviewService;
    private final InvoiceImportService invoiceImportService;

    @PostMapping(
            value = "/preview",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public InvoicePreviewResponse preview(
            @RequestParam("file") MultipartFile file
    ) {
        return invoicePreviewService.preview(file);
    }

    @PostMapping("/import")
    public InvoiceImportResponse importInvoice(
            @RequestBody @Valid InvoiceImportRequest request
    ) {
        return invoiceImportService.importInvoice(request);
    }
}