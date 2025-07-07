//package com.system.restaurant.management.controller;
//
//import com.system.restaurant.management.entity.User;
//import com.system.restaurant.management.service.AuthService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@RequiredArgsConstructor
//public class AuthController {
//
//    private final AuthService authService;
//
//    @PostMapping("/login")
//    public ResponseEntity<User> login(@RequestParam String username, @RequestParam String password) {
//        User user = authService.login(username, password);
//        return ResponseEntity.ok(user);
//    }
//
//    @PostMapping("/validate")
//    public ResponseEntity<Boolean> validateUser(@RequestParam String username, @RequestParam String password) {
//        boolean isValid = authService.validateUser(username, password);
//        return ResponseEntity.ok(isValid);
//    }
//}