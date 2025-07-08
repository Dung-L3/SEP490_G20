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
@Table(name = "Areas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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