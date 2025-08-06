package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ComboItems")
@IdClass(ComboItemId.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ComboItem {
    @Id
    @Column(name = "ComboID")
    private Integer comboId;

    @Id
    @Column(name = "DishID")
    private Integer dishId;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ComboID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Combo combo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DishID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Dish dish;
}