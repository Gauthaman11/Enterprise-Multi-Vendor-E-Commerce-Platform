package com.javaenterprise.cart.service;

import com.javaenterprise.cart.dto.CartRequest;
import com.javaenterprise.cart.dto.CartResponse;
import com.javaenterprise.cart.dto.CartSummaryResponse;
import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.cart.repository.CartRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartResponse addToCart(CartRequest request,
                                  Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow();

        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .orElse(null);

        if (cart == null) {
            cart = Cart.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        } else {
            cart.setQuantity(cart.getQuantity() + request.getQuantity());
        }

        cartRepository.save(cart);

        return map(cart);
    }

    public CartSummaryResponse getCart(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        List<Cart> items = cartRepository.findByUser(user);

        List<CartResponse> responses = items.stream()
                .map(this::map)
                .toList();

        BigDecimal total = responses.stream()
                .map(CartResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = responses.stream()
                .mapToInt(CartResponse::getQuantity)
                .sum();

        return CartSummaryResponse.builder()
                .items(responses)
                .totalAmount(total)
                .totalItems(totalItems)
                .build();
    }

    public CartResponse updateQuantity(Long cartId,
                                       CartRequest request,
                                       Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cart.setQuantity(request.getQuantity());

        cartRepository.save(cart);

        return map(cart);
    }

    public void removeItem(Long cartId,
                           Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow();

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cartRepository.delete(cart);
    }

    public void clearCart(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        cartRepository.deleteByUser(user);
    }

    private CartResponse map(Cart cart) {

        BigDecimal subtotal = cart.getProduct()
                .getPrice()
                .multiply(BigDecimal.valueOf(cart.getQuantity()));

        return CartResponse.builder()
                .cartId(cart.getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getName())
                .imageUrl(cart.getProduct().getImageUrl())
                .price(cart.getProduct().getPrice())
                .quantity(cart.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}