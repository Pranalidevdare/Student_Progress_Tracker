package com.example.SPT.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.User;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

	Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    long countByRole(Role role);

    long countByRoleAndTrainerType(Role role, TrainerType trainerType);

    long countByEnabled(boolean enabled);

}