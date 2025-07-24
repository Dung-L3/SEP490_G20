// AuthServiceImpl.java
package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.LoginRequest;
import com.system.restaurant.management.dto.LoginResponse;
import com.system.restaurant.management.dto.RegisterRequest;
import com.system.restaurant.management.entity.Role;
import com.system.restaurant.management.entity.User;
import com.system.restaurant.management.entity.Customer;
import com.system.restaurant.management.repository.UserRepository;
import com.system.restaurant.management.repository.RoleRepository;
import com.system.restaurant.management.repository.CustomerRepository;
import com.system.restaurant.management.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final CustomerRepository custRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void registerEmployee(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        if (userRepo.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
        }

        Role role = roleRepo.findByRoleName(req.getRoleName().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Role không tồn tại: " + req.getRoleName()));
        User u = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .status(true)
                .createdAt(LocalDateTime.now())
                .build();
        u.getRoles().add(role);
        userRepo.save(u);
    }

    @Override
    @Transactional
    public void registerCustomer(RegisterRequest req) {
        if (custRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        if (custRepo.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
        }
        Role role = roleRepo.findByRoleName("customer")
                .orElseThrow();
        User u = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .status(true)
                .createdAt(LocalDateTime.now())
                .build();
        u.getRoles().add(role);
        userRepo.save(u);

        Customer c = Customer.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .loyaltyPoints(0)
                .memberSince(LocalDate.now())
                .build();
        custRepo.save(c);
    }

    public User validateLogin(LoginRequest request) {
        User user = userRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Sai mật khẩu");
        }

        return user;
    }
}
