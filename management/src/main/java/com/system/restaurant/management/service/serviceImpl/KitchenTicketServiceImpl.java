package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.KitchenTicket;
import com.system.restaurant.management.repository.KitchenTicketRepository;
import com.system.restaurant.management.service.KitchenTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class KitchenTicketServiceImpl implements KitchenTicketService {

    @Autowired
    private KitchenTicketRepository kitchenTicketRepository;

    @Override
    public KitchenTicket printKitchenTicket(Integer orderId, Integer printedBy) {
        KitchenTicket ticket = new KitchenTicket();
        ticket.setOrderId(orderId);
        ticket.setPrintedBy(printedBy);
        ticket.setPrintedAt(LocalDateTime.now());
        return kitchenTicketRepository.save(ticket);
    }

    @Override
    public List<KitchenTicket> getKitchenTicketsByOrder(Integer orderId) {
        return kitchenTicketRepository.findByOrderId(orderId);
    }
}