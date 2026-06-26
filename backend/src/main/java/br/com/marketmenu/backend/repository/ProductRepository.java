package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}