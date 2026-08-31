package com.javaenterprise.admin.controller;

import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/warehouses")
@RequiredArgsConstructor
public class AdminWarehouseController {

    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Warehouse> getAll() {
        return warehouseRepository.findAll();
    }

    @PostMapping
    public Warehouse create(@RequestBody Map<String, String> body) {
        Warehouse w = Warehouse.builder()
                .name(body.get("name"))
                .city(body.get("city"))
                .state(body.get("state"))
                .active(true)
                .build();
        return warehouseRepository.save(w);
    }

    @PutMapping("/assign-staff")
    public Map<String, Object> assignStaff(@RequestParam Long userId,
                                           @RequestParam Long warehouseId) {
        User staff = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Warehouse wh = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        staff.setWarehouse(wh);
        userRepository.save(staff);

        return Map.of("message", "Staff assigned successfully", "warehouse", wh.getName());
    }
}