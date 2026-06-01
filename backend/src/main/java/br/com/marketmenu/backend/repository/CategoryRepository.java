package br.com.marketmenu.backend.repository;

import br.com.marketmenu.backend.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}