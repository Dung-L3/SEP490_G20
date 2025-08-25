package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    @Query("select c.loyaltyPoints from Customer c where c.phone = :phone")
    Optional<Integer> findLoyaltyPointsByPhone(@Param("phone") String phone);
}
