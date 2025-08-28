package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.repository.RestaurantTableRepository;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {
    
    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTable getById(Integer id) {
        return restaurantTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));
    }

    public RestaurantTable save(RestaurantTable table) {
        return restaurantTableRepository.save(table);
    }

    public void deleteById(Integer id) {
        restaurantTableRepository.deleteById(id);
    }

    public boolean existsById(Integer id) {
        return restaurantTableRepository.existsById(id);
    }

    public RestaurantTable updateStatus(Integer id, String status) {
        RestaurantTable table = getById(id);
        table.setStatus(status);
        return restaurantTableRepository.save(table);
    }

    public List<RestaurantTable> findAll() {
        return restaurantTableRepository.findAll();
    }

    public List<RestaurantTable> findByStatus(String status) {
        return restaurantTableRepository.findByStatus(status);
    }

    public List<RestaurantTable> findByAreaId(Integer areaId) {
        return restaurantTableRepository.findByAreaId(areaId);
    }
}
