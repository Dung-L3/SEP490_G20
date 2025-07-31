package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "WorkShifts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShiftID")
    private Integer shiftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @Column(name = "ShiftDate", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    @Column(name = "HandoverTo", nullable = true)
    private Integer handOverTo;

    @Column(name = "HandoverNotes", nullable = true)
    private String handOverNotes;

    @Column(name = "IsOverNight", nullable = true)
    private int isOverNight;

}