package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.service.ComboService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @GetMapping
    public ResponseEntity<List<ComboDTO>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @GetMapping("/{comboId}")
    public ResponseEntity<ComboDTO> getComboById(@PathVariable Integer comboId) {
        return ResponseEntity.ok(comboService.getComboById(comboId));
    }

    @PostMapping
    public ResponseEntity<ComboDTO> createCombo(@Valid @RequestBody CreateComboRequest request) {
        ComboDTO createdCombo = comboService.createCombo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCombo);
    }

    @PutMapping("/{comboId}")
    public ResponseEntity<ComboDTO> updateCombo(
            @PathVariable Integer comboId,
            @Valid @RequestBody UpdateComboRequest request) {
        return ResponseEntity.ok(comboService.updateCombo(comboId, request));
    }

    @DeleteMapping("/{comboId}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Integer comboId) {
        comboService.deleteCombo(comboId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ComboDTO>> searchCombosByName(@RequestParam String name) {
        return ResponseEntity.ok(comboService.searchCombosByName(name));
    }
}