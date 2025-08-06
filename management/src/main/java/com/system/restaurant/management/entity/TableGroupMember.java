package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "TableGroupMembers")
public class TableGroupMember {
    @EmbeddedId
    private TableGroupMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "GroupID")
    private TableGroup tableGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tableId")
    @JoinColumn(name = "TableID")
    private RestaurantTable table;

    public TableGroupMember(Integer groupId, Integer tableId) {
        this.id = new TableGroupMemberId(groupId, tableId);
    }
}