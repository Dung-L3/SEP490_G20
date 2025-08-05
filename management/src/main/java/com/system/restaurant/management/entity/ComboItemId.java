package com.system.restaurant.management.entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboItemId implements Serializable {
    private Integer comboId;
    private Integer dishId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ComboItemId that = (ComboItemId) o;
        return Objects.equals(comboId, that.comboId) && Objects.equals(dishId, that.dishId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(comboId, dishId);
    }
}