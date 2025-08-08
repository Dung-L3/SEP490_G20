package com.system.restaurant.management.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TableGroupMemberId implements Serializable {
    private Integer groupId;
    private Integer tableId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TableGroupMemberId that = (TableGroupMemberId) o;
        return Objects.equals(groupId, that.groupId) && Objects.equals(tableId, that.tableId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, tableId);
    }
}