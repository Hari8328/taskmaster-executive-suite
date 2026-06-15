package com.taskmaster.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspiration")
public class InspirationController {

    @GetMapping("/thought-of-day")
    public ResponseEntity<?> getThoughtOfDay() {
        return ResponseEntity.ok(Map.of(
            "quote", "If you don't really have a dream, you can't really push yourself.",
            "author", "M.S. Dhoni",
            "role", "Cricket Legend & Leader",
            "avatar", "https://picsum.photos/seed/dhoni/100/100",
            "background", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
        ));
    }

    @GetMapping("/quotes")
    public ResponseEntity<?> getQuotes() {
        return ResponseEntity.ok(List.of(
            Map.of("id", "1", "text", "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.", "author", "Steve Jobs", "avatar", "https://picsum.photos/seed/jobs/100/100"),
            Map.of("id", "2", "text", "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author", "Winston Churchill", "avatar", "https://picsum.photos/seed/churchill/100/100"),
            Map.of("id", "3", "text", "It's not whether you get knocked down, it's whether you get up.", "author", "Vince Lombardi", "avatar", "https://picsum.photos/seed/lombardi/100/100")
        ));
    }

    @GetMapping("/reading-list")
    public ResponseEntity<?> getReadingList() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "1",
                "title", "The Art of Resilience",
                "description", "Learn how top performers build psychological safety and grit through intentional reflection.",
                "category", "Reading List",
                "coverImage", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=687"
            )
        ));
    }

    @GetMapping("/growth")
    public ResponseEntity<?> getGrowth() {
        return ResponseEntity.ok(Map.of(
            "overall", 72,
            "knowledge", 85,
            "consistency", 60
        ));
    }
}
