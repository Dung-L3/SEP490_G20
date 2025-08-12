package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndStatus(String username, Boolean status);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByFullNameContainingIgnoreCase(String fullName);

    @Query("""
      SELECT u
      FROM User u
      WHERE NOT EXISTS (
        SELECT r
        FROM u.roles r
        WHERE r.id = :roleId
      )
      """)
    List<User> findAllWithoutRole(@Param("roleId") Integer roleId);
}