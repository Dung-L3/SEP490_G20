package com.system.restaurant.management.dto.request;

public class TableStatusRequest {
    private String status;

    // Default constructor
    public TableStatusRequest() {}

    // Constructor with parameter
    public TableStatusRequest(String status) {
        this.status = status;
    }

    // Getter
    public String getStatus() {
        return status;
    }

    // Setter
    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "TableStatusRequest{" +
                "status='" + status + '\'' +
                '}';
    }
}