package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.InvoicePrint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoicePrintRepository extends JpaRepository<InvoicePrint, Integer> {
}
