package com.javaenterprise.vendor.service;

import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.repository.CategoryRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.vendor.dto.VendorProductRequest;
import com.javaenterprise.vendor.dto.VendorProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Get logged-in vendor
     */
    private User getVendor(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    /**
     * Get all products of logged-in vendor
     */
    public List<VendorProductResponse> getMyProducts(Authentication authentication) {

        User vendor = getVendor(authentication);

        return productRepository.findByVendor(vendor)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get single product
     */
    public VendorProductResponse getProduct(Long id,
                                            Authentication authentication) {

        User vendor = getVendor(authentication);

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return mapToResponse(product);
    }

    /**
     * Add new product
     */
    @Transactional
    public VendorProductResponse addProduct(VendorProductRequest request,
                                            Authentication authentication) {

        User vendor = getVendor(authentication);

        com.javaenterprise.product.entity.Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .vendor(vendor)
                .active(true)
                .build();

        productRepository.save(product);

        return mapToResponse(product);
    }

    /**
     * Update product
     */
    @Transactional
    public VendorProductResponse updateProduct(Long id,
                                               VendorProductRequest request,
                                               Authentication authentication) {

        User vendor = getVendor(authentication);

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        productRepository.save(product);

        return mapToResponse(product);
    }

    /**
     * Delete product
     */
    @Transactional
    public void deleteProduct(Long id,
                              Authentication authentication) {

        User vendor = getVendor(authentication);

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    /**
     * Update stock only
     */
    @Transactional
    public VendorProductResponse updateStock(Long id,
                                             Integer stock,
                                             Authentication authentication) {

        User vendor = getVendor(authentication);

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStock(stock);

        productRepository.save(product);

        return mapToResponse(product);
    }

    /**
     * Update price only
     */
    @Transactional
    public VendorProductResponse updatePrice(Long id,
                                             BigDecimal price,
                                             Authentication authentication) {

        User vendor = getVendor(authentication);

        Product product = productRepository.findByIdAndVendor(id, vendor)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setPrice(price);

        productRepository.save(product);

        return mapToResponse(product);
    }

    /**
     * Convert Entity -> DTO
     */
    private VendorProductResponse mapToResponse(Product product) {

        return VendorProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory().getName())
                .active(product.isActive())
                .build();
    }
}