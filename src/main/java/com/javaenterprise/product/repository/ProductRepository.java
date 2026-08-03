package com.javaenterprise.product.repository;

import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByCategory(Category category);

    List<Product> findByVendor(User vendor);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    List<Product> findByCategory_NameIgnoreCaseAndActiveTrue(String category);

    List<Product> findByPriceBetweenAndActiveTrue(BigDecimal min, BigDecimal max);
}