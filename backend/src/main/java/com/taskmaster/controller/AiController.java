package com.taskmaster.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Helper to retrieve the API Key from system environment variables
    private String getGeminiApiKey() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("API_KEY");
        }
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("GOOGLE_API_KEY");
        }
        return key != null ? key.trim() : "";
    }

    // Standard Gemini REST API calling helper
    private String callGemini(String systemInstruction, String promptText) throws Exception {
        String apiKey = getGeminiApiKey();
        if (apiKey.isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        // We use gemini-3.5-flash to match the original mock backend model configuration
        String modelName = "gemini-3.5-flash";
        String urlStr = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        // Build the contents JSON payload
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
        requestBody.put("contents", List.of(contentPart));

        // Add System Instructions if present
        if (systemInstruction != null && !systemInstruction.trim().isEmpty()) {
            Map<String, Object> systemPart = Map.of("parts", List.of(Map.of("text", systemInstruction)));
            requestBody.put("systemInstruction", systemPart);
        }

        // Add response configuration to enforce JSON format
        Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlStr))
                .header("Content-Type", "application/json")
                .header("User-Agent", "aistudio-build")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API call failed with status: " + response.statusCode() + ", body: " + response.body());
        }

        // Parse response body to extract text
        Map<String, Object> responseMap = objectMapper.readValue(response.body(), new TypeReference<>() {});
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            if (content != null) {
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        throw new RuntimeException("Could not extract text from Gemini response: " + response.body());
    }

    @PostMapping("/breakdown")
    public ResponseEntity<?> breakdownTask(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Task");
        String description = request.getOrDefault("description", "");

        List<String> fallback = Arrays.asList(
                "Establish strategic requirements for: " + title,
                "Blueprint key architecture components",
                "Execute implementation and integration",
                "Conduct final review and verification"
        );

        try {
            String prompt = "Break down the following task into 3-5 clear, actionable sub-steps for a productivity app. " +
                    "Return ONLY a JSON array of strings.\n" +
                    "Task Title: " + title + "\n" +
                    "Task Description: " + description;

            String response = callGemini(null, prompt);
            List<String> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warn("Gemini task breakdown failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/suggest-priority")
    public ResponseEntity<?> suggestPriority(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Task");
        String description = request.getOrDefault("description", "");
        String dueDate = request.getOrDefault("dueDate", "Not set");

        Map<String, String> fallback = Map.of("priority", "medium");

        try {
            String prompt = "Suggest a priority level (high, medium, or low) for a task based on its details.\n" +
                    "Title: " + title + "\n" +
                    "Description: " + description + "\n" +
                    "Due Date: " + dueDate + "\n" +
                    "Today is: " + LocalDate.now().toString() + "\n\n" +
                    "Return a JSON object with a key 'priority' having value of high, medium, or low. Example: {\"priority\": \"medium\"}";

            String response = callGemini(null, prompt);
            Map<String, String> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            if (result.containsKey("priority")) {
                String val = result.get("priority").toLowerCase();
                if (List.of("high", "medium", "low").contains(val)) {
                    return ResponseEntity.ok(Map.of("priority", val));
                }
            }
            return ResponseEntity.ok(fallback);
        } catch (Exception e) {
            logger.warn("Gemini suggest priority failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/suggest-batch-priorities")
    public ResponseEntity<?> suggestBatchPriorities(@RequestBody Map<String, List<Map<String, Object>>> request) {
        List<Map<String, Object>> tasks = request.get("tasks");
        if (tasks == null) {
            return ResponseEntity.badRequest().body("Tasks must be provided");
        }

        List<String> fallback = new ArrayList<>();
        for (int i = 0; i < tasks.size(); i++) {
            fallback.add("medium");
        }

        try {
            StringBuilder taskSummary = new StringBuilder();
            for (int i = 0; i < tasks.size(); i++) {
                Map<String, Object> t = tasks.get(i);
                taskSummary.append(i + 1).append(". Title: ").append(t.get("title"))
                        .append(", Description: ").append(t.get("description"))
                        .append(", DueDate: ").append(t.getOrDefault("dueDate", "N/A"))
                        .append("\n");
            }

            String prompt = "Analyze the following tasks and suggest the most appropriate priority level (high, medium, or low) for each one based on its details.\n" +
                    "Be strategic and balance the load.\n" +
                    "Today is: " + LocalDate.now().toString() + "\n\n" +
                    "Tasks:\n" + taskSummary + "\n" +
                    "Return ONLY a JSON list of priority strings in the exact same order as the tasks, e.g. [\"high\", \"low\", \"medium\"].";

            String response = callGemini(null, prompt);
            List<String> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warn("Gemini batch priority failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/coaching")
    public ResponseEntity<?> getCoaching(@RequestBody Map<String, Object> request) {
        Object completed = request.getOrDefault("completedCount", 0);
        Object todo = request.getOrDefault("todoCount", 0);
        Object progress = request.getOrDefault("inProgressCount", 0);
        Object focus = request.getOrDefault("focusTime", "00:00");

        Map<String, String> fallback = Map.of("coaching", "Every brick laid today builds tomorrow's foundation. Trust the momentum of small habits.");

        try {
            String prompt = "Based on my current productivity stats, provide 1-2 sentences of encouraging, slightly philosophical coaching in a minimalist, editorial tone.\n" +
                    "- Completed: " + completed + "\n" +
                    "- To Do: " + todo + "\n" +
                    "- In Progress: " + progress + "\n" +
                    "- Total Focus Time: " + focus + "\n\n" +
                    "Return ONLY a JSON object with a key 'coaching' e.g. {\"coaching\": \"Your coaching quote.\"}";

            String response = callGemini(null, prompt);
            Map<String, String> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            if (result.containsKey("coaching")) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.ok(fallback);
        } catch (Exception e) {
            logger.warn("Gemini coaching failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(@RequestBody Map<String, List<Map<String, Object>>> request) {
        List<Map<String, Object>> tasks = request.get("tasks");
        if (tasks == null) {
            return ResponseEntity.badRequest().body("Tasks must be provided");
        }

        List<Map<String, String>> fallback = List.of(
                Map.of("title", "Batch Foundation Tasks", "description", "Consolidate similar administrative items to minimize cognitive switches.", "category", "Focus"),
                Map.of("title", "Daily Review Blueprint", "description", "Dedicate 5 minutes to align your active priorities with long-term goals.", "category", "Organization"),
                Map.of("title", "Respect Peak Energy", "description", "Identify hours of peak clarity and reserve them for deep architectural design.", "category", "Mindset")
        );

        try {
            StringBuilder taskSummary = new StringBuilder();
            int limit = Math.min(tasks.size(), 10);
            for (int i = 0; i < limit; i++) {
                Map<String, Object> t = tasks.get(i);
                taskSummary.append("- ").append(t.get("title")).append(" (").append(t.get("status"))
                        .append(", Priority: ").append(t.get("priority")).append(")\n");
            }

            String prompt = "Analyze my current task list and provide 3-4 specific productivity suggestions or \"architectural shifts\" to improve my flow.\n" +
                    "Current Tasks:\n" + taskSummary + "\n" +
                    "Return ONLY a JSON array of objects with keys 'title', 'description', and 'category' (which must be 'Focus', 'Organization', or 'Mindset').";

            String response = callGemini(null, prompt);
            List<Map<String, String>> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warn("Gemini suggestions failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/combined-insight")
    public ResponseEntity<?> getCombinedInsight(@RequestBody Map<String, Object> request) {
        Object completed = request.getOrDefault("completedCount", 0);
        Object todo = request.getOrDefault("todoCount", 0);
        Object progress = request.getOrDefault("inProgressCount", 0);
        Object focus = request.getOrDefault("focusTime", "00:00");
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) request.get("tasks");

        Map<String, Object> fallback = Map.of(
                "coaching", "Maintain your trajectory. Focus on consistency and micro-steps to build compounding growth.",
                "suggestions", List.of(
                        Map.of("title", "Single-Task Clarity", "description", "Minimize cognitive leakage by dedicating your attention exclusively to high-impact milestones.", "category", "Focus"),
                        Map.of("title", "Audit Pending Items", "description", "Take a few minutes to filter outdated tasks and keep your environment clean.", "category", "Organization"),
                        Map.of("title", "Acknowledge Micro-Gains", "description", "Celebrate small task completions to reinforce continuous forward momentum.", "category", "Mindset")
                )
        );

        try {
            StringBuilder taskSummary = new StringBuilder();
            if (tasks != null) {
                int limit = Math.min(tasks.size(), 10);
                for (int i = 0; i < limit; i++) {
                    Map<String, Object> t = tasks.get(i);
                    taskSummary.append("- ").append(t.get("title")).append(" (").append(t.get("status"))
                            .append(", Priority: ").append(t.get("priority")).append(")\n");
                }
            }

            String prompt = "Analyze my productivity stats and tasks, and provide:\n" +
                    "1. A coaching message (1-2 sentences) in a philosophical, minimalist tone.\n" +
                    "2. 3 detailed suggestions to optimize my workflow (specify category as Focus, Organization, or Mindset).\n\n" +
                    "STATS:\n" +
                    "- Completed: " + completed + "\n" +
                    "- To Do: " + todo + "\n" +
                    "- In Progress: " + progress + "\n" +
                    "- Focus Time: " + focus + "\n\n" +
                    "TASKS:\n" + taskSummary + "\n" +
                    "Return ONLY a JSON object containing keys 'coaching' (String) and 'suggestions' (Array of suggestion objects with keys 'title', 'description', 'category').";

            String response = callGemini(null, prompt);
            Map<String, Object> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warn("Gemini combined insight failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    private List<String> distributeTimes(String startStr, String endStr, int count) {
        try {
            int startH = Integer.parseInt(startStr.split(":")[0]);
            int startM = Integer.parseInt(startStr.split(":")[1]);
            int endH = Integer.parseInt(endStr.split(":")[0]);
            int endM = Integer.parseInt(endStr.split(":")[1]);

            int startMin = startH * 60 + startM;
            int endMin = endH * 60 + endM;
            int diff = endMin > startMin ? endMin - startMin : (24 * 60 - startMin) + endMin;

            List<String> times = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                double fraction = count > 1 ? (double) i / (count - 1) : 0;
                int slotMin = (int) Math.round(startMin + diff * fraction);
                int h = (slotMin / 60) % 24;
                int m = slotMin % 60;
                times.add(String.format("%02d:%02d", h, m));
            }
            return times;
        } catch (Exception e) {
            return List.of("09:00", "11:30", "14:00", "16:30");
        }
    }

    @PostMapping("/roadmap")
    public ResponseEntity<?> getRoadmap(@RequestBody Map<String, Object> request) {
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) request.get("tasks");
        String startTime = (String) request.getOrDefault("startTime", "09:00");
        String endTime = (String) request.getOrDefault("endTime", "18:00");

        List<String> fallbackTimes = distributeTimes(startTime, endTime, 4);

        Map<String, Object> fallback = Map.of(
                "vision", "Intentional actions yield architectural excellence within your chosen timeframe.",
                "roadmap", List.of(
                        Map.of("phase", "Structure & Foundation", "goal", "Clear high-impact priority tasks starting at " + startTime + "."),
                        Map.of("phase", "Steady Construction", "goal", "Maintain steady progress on pending issues without interruptions."),
                        Map.of("phase", "Review & Refine", "goal", "Evaluate progress, log focus hours, and wrap up by " + endTime + ".")
                ),
                "timetable", List.of(
                        Map.of("time", fallbackTimes.get(0), "activity", "High-Priority Blueprint Tasks", "vibe", "Focused"),
                        Map.of("time", fallbackTimes.get(1), "activity", "Core Action Block", "vibe", "Determined"),
                        Map.of("time", fallbackTimes.get(2), "activity", "Maintenance & Collaboration", "vibe", "Constructive"),
                        Map.of("time", fallbackTimes.get(3), "activity", "Daily Review & Feedback Loop", "vibe", "Peaceful")
                )
        );

        if (tasks == null) {
            return ResponseEntity.ok(fallback);
        }

        try {
            StringBuilder taskSummary = new StringBuilder();
            int limit = 0;
            for (Map<String, Object> t : tasks) {
                if (!"completed".equalsIgnoreCase((String) t.get("status")) && !"COMPLETED".equalsIgnoreCase((String) t.get("status"))) {
                    taskSummary.append("- ").append(t.get("title")).append(" (").append(t.get("priority")).append(" priority)\n");
                    limit++;
                    if (limit >= 8) break;
                }
            }

            String prompt = "Architect a \"Positive Roadmap & Timetable\" for my day based on these tasks.\n" +
                    "Be encouraging, vision-oriented, and structured.\n" +
                    "Today is: " + LocalDate.now().toString() + "\n\n" +
                    "CRITICAL TIMING PARAMETERS:\n" +
                    "The whole user schedule must be distributed strictly between " + startTime + " and " + endTime + ".\n" +
                    "All timestamps in the timetable MUST fall on or after " + startTime + " and be completed on or before " + endTime + " (24-hour HH:MM format).\n" +
                    "Distribute activities logically across this timeframe.\n\n" +
                    "Tasks:\n" + taskSummary + "\n\n" +
                    "Return ONLY a JSON object matching this structure:\n" +
                    "{\n" +
                    "  \"vision\": \"A one-sentence inspiring theme for the day\",\n" +
                    "  \"roadmap\": [\n" +
                    "    {\"phase\": \"Phase Name (e.g. Morning Momentum)\", \"goal\": \"Primary focus for this phase\"}\n" +
                    "  ],\n" +
                    "  \"timetable\": [\n" +
                    "    {\"time\": \"HH:MM\", \"activity\": \"Specific task or activity\", \"vibe\": \"Positive adjective (e.g. Revitalizing)\"}\n" +
                    "  ]\n" +
                    "}";

            String response = callGemini(null, prompt);
            Map<String, Object> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.warn("Gemini daily roadmap failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) request.get("tasks");
        List<Map<String, Object>> history = (List<Map<String, Object>>) request.get("history");

        String fallbackText = "I’ve aligned with your active tasks to keep your workflow fluid. Ask me anything about scaling your productivity blueprint!";

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message is required");
        }

        try {
            StringBuilder taskSummary = new StringBuilder();
            if (tasks != null) {
                int limit = Math.min(tasks.size(), 15);
                for (int i = 0; i < limit; i++) {
                    Map<String, Object> t = tasks.get(i);
                    taskSummary.append("- ").append(t.get("title")).append(" [Status: ").append(t.get("status"))
                            .append(", Priority: ").append(t.get("priority")).append("]\n");
                }
            }

            StringBuilder historySummary = new StringBuilder();
            if (history != null) {
                for (Map<String, Object> h : history) {
                    String role = (String) h.get("role");
                    List<Map<String, String>> parts = (List<Map<String, String>>) h.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = parts.get(0).get("text");
                        historySummary.append(role).append(": ").append(text).append("\n");
                    }
                }
            }

            String systemPrompt = "You are the \"AI Productivity Architect\". Your tone is minimalist, encouraging, and slightly philosophical.\n" +
                    "You help the user optimize their life and tasks.\n\n" +
                    "CONTEXT:\n" +
                    "Current Tasks:\n" + taskSummary + "\n\n" +
                    "GUIDELINES:\n" +
                    "- Be concise.\n" +
                    "- Offer structural suggestions (roadmap, prioritization, batching).\n" +
                    "- Use architectural metaphors (blueprints, foundations, structural shifts).\n" +
                    "- High degree of positivity.";

            String prompt = "Chat History:\n" + historySummary + "\n" +
                    "User message: " + message + "\n\n" +
                    "Suggest a helpful response. Return ONLY a JSON object containing the key 'text', e.g. {\"text\": \"Your response here.\"}";

            String response = callGemini(systemPrompt, prompt);
            Map<String, String> result = objectMapper.readValue(response.trim(), new TypeReference<>() {});
            if (result.containsKey("text")) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.ok(Map.of("text", fallbackText));
        } catch (Exception e) {
            logger.warn("Gemini chat failed, returning fallback. Error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("text", fallbackText));
        }
    }
}
