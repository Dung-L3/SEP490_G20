package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "Areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AreaID")
    private Integer areaId;

    @Column(name = "AreaName", nullable = false, length = 50)
    private String areaName;

    @Column(name = "Description", length = 255)
    private String description;
}