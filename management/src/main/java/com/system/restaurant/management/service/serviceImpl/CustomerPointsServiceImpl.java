//package com.system.restaurant.management.service.serviceImpl;
//
//import com.system.restaurant.management.entity.Order;
//import com.system.restaurant.management.entity.User;
//import com.system.restaurant.management.repository.OrderRepository;
//import com.system.restaurant.management.repository.UserRepository;
//import com.system.restaurant.management.service.CustomerPointsService;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//
//@Service
//@Transactional
//public class CustomerPointsServiceImpl implements CustomerPointsService {
//
//    private final OrderRepository orderRepo;
//    private final UserRepository userRepo;
//
//    public CustomerPointsServiceImpl(OrderRepository orderRepo, UserRepository userRepo) {
//        this.orderRepo = orderRepo;
//        this.userRepo = userRepo;
//    }
//
//    @Override
//    public void addPoints(Integer orderId, BigDecimal finalTotal) {
//        Order order = orderRepo.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
//
//        User customer = order.getUser();
//        if (customer == null) {
//            throw new RuntimeException("Order has no associated user/customer.");
//        }
//
//        int points = finalTotal.divide(BigDecimal.valueOf(10000), 0, BigDecimal.ROUND_DOWN).intValue();
//        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
//
//        userRepo.save(customer);
//    }
//}
