package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Integer> {

    @Query("SELECT pr FROM PaymentRecord pr WHERE pr.invoiceId = :invoiceId")
    List<PaymentRecord> findByInvoiceId(@Param("invoiceId") Integer invoiceId);

    @Query("SELECT pr FROM PaymentRecord pr WHERE pr.methodId = :methodId")
    List<PaymentRecord> findByMethodId(@Param("methodId") Integer methodId);
}