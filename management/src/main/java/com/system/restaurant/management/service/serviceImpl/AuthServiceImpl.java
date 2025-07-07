//package com.system.restaurant.management.serviceImpl;
//
//import com.system.restaurant.management.entity.User;
//import com.system.restaurant.management.repository.UserRepository;
//import com.system.restaurant.management.service.AuthService;
//import com.system.restaurant.management.exception.AuthenticationException;
//import org.springframework.beans.factory.annotation.Autowired;
////import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AuthServiceImpl implements AuthService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    //private PasswordEncoder passwordEncoder;
//
//    @Override
//    public User login(String username, String password) {
//        User user = userRepository.findByUsernameAndStatus(username, true)
//                .orElseThrow(() -> new AuthenticationException("Invalid username or password"));
//
//        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
//            throw new AuthenticationException("Invalid username or password");
//        }
//
//        return user;
//    }
//
//    @Override
//    public boolean validateUser(String username, String password) {
//        try {
//            login(username, password);
//            return true;
//        } catch (AuthenticationException e) {
//            return false;
//        }
//    }
//}