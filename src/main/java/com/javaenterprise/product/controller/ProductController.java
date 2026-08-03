package com.javaenterprise.product.controller;

import com.javaenterprise.product.dto.ProductRequest;
import com.javaenterprise.product.dto.ProductResponse;
import com.javaenterprise.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    public ProductResponse add(@Valid @RequestBody ProductRequest request,
                               Authentication authentication){

        return service.add(request, authentication);
    }

    @GetMapping
    public List<ProductResponse> getAll(){

        return service.getAll();
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id){

        return service.getById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request){

        return service.update(id,request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){

        service.delete(id);
    }
    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam String keyword) {

        return service.search(keyword);
    }

    @GetMapping("/category")
    public List<ProductResponse> category(@RequestParam String name) {

        return service.category(name);
    }

    @GetMapping("/price")
    public List<ProductResponse> price(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {

        return service.price(min, max);
    }

}