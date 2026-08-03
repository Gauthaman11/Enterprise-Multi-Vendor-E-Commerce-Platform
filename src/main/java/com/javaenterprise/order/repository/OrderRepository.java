package com.javaenterprise.order.repository;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndUser(Long id, User user);
    List<Order> findByUser(User user);
}