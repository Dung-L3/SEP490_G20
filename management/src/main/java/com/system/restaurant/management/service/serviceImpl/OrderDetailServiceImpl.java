package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.OrderDetailDTO;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.repository.OrderRepository;
import com.system.restaurant.management.service.OrderDetailService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderRepository orderRepo;
    private final OrderDetailRepository detailRepo;

    public OrderDetailServiceImpl(OrderRepository orderRepo,
                                  OrderDetailRepository detailRepo) {
        this.orderRepo  = orderRepo;
        this.detailRepo = detailRepo;
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByOrderId(Integer orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order không tồn tại với id = " + orderId
                ));

        List<OrderDetail> details = detailRepo.findByOrderIdAndStatusId(order.getOrderId(), 2);
        return details.stream()
                .map(OrderDetailDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByOrderIdAndStatus(Integer orderId, Integer statusId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order không tồn tại với id = " + orderId
                ));

        List<OrderDetail> details = detailRepo.findByOrderId(order.getOrderId());
        return details.stream()
                .filter(detail -> detail.getStatusId().equals(statusId))
                .map(OrderDetailDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
