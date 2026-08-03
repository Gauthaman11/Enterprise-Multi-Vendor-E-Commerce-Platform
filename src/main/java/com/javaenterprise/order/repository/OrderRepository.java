package com.javaenterprise.order.repository;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndUser(Long id, User user);
    List<Order> findByUser(User user);
    List<Order> findByStatus(OrderStatus status);


    long countByStatus(OrderStatus status);

    @Query("""
SELECT COALESCE(SUM(o.totalAmount),0)
FROM Order o
WHERE o.status='COMPLETED'
""")
    BigDecimal totalRevenue();
}