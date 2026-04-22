package ch.fhnw.bitsemesterplanner.business.service;

import ch.fhnw.bitsemesterplanner.business.exception.DuplicateEntryException;
import ch.fhnw.bitsemesterplanner.business.exception.EntityNotFoundException;
import ch.fhnw.bitsemesterplanner.data.domain.Role;
import ch.fhnw.bitsemesterplanner.data.domain.User;
import ch.fhnw.bitsemesterplanner.data.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerStudent(String firstName, String lastName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEntryException("A user with this email already exists.");
        }
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.STUDENT);
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
    }

    public User getCurrentUser(Authentication auth) {
        return findByEmail(auth.getName());
    }

    public User updateProfile(Long userId, String firstName, String lastName, String email, String password) {
        User user = findById(userId);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (email != null && user.getRole() != Role.ADMIN) {
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new DuplicateEntryException("A user with this email already exists.");
            }
            user.setEmail(email);
        }
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        return userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
