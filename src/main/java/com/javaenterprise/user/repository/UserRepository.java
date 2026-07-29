package com.javaenterprise.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.javaenterprise.user.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
}