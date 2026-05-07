package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @RequestMapping("/test")
    public String test() {
        return "Spring Boot 4 + Java 21 + React 18 + Vite 5 działa!";
    }
}
