package com.system.restaurant.management.exception;


import lombok.*;

@Getter
@ToString
@AllArgsConstructor
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;
}