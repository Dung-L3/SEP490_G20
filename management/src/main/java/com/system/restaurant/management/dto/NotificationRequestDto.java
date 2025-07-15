package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
    private String title;
    private String message;
    private Integer recipientId;
    private String channel;
}