package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Dishes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DishID")
    private Integer dishId;

    @Column(name = "DishName", nullable = false, length = 100)
    private String dishName;

    @Column(name = "CategoryID", nullable = false)
    private Integer categoryId;

    @Column(name = "Price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "Status", nullable = false)
    private Boolean status = true;

    @Column(name = "Unit", nullable = false, length = 50)
    private String unit;

    @Column(name = "ImageUrl", length = 255)
    private String imageUrl;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}