package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.KitchenTicket;

import java.util.List;

public interface KitchenTicketService {
    KitchenTicket printKitchenTicket(Integer orderId, Integer printedBy);
    List<KitchenTicket> getKitchenTicketsByOrder(Integer orderId);
}