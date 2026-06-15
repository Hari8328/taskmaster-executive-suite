import api from "../services/api";
export const hasGeminiKey = true;
export const breakdownTask = async (title, description) => {
  try {
    const response = await api.post("/ai/breakdown", { title, description });
    return response.data;
  } catch (err) {
    console.error("breakdownTask error:", err);
    throw err;
  }
};
export const suggestPriority = async (title, description, dueDate) => {
  try {
    const response = await api.post("/ai/suggest-priority", { title, description, dueDate });
    return response.data.priority;
  } catch (err) {
    console.error("suggestPriority error:", err);
    return "medium";
  }
};
export const suggestBatchPriorities = async (tasks) => {
  try {
    const response = await api.post("/ai/suggest-batch-priorities", { tasks });
    return response.data;
  } catch (err) {
    console.error("suggestBatchPriorities error:", err);
    return tasks.map(() => "medium");
  }
};
export const getAIProgressCoaching = async (completedCount, todoCount, inProgressCount, focusTime) => {
  try {
    const response = await api.post("/ai/coaching", {
      completedCount,
      todoCount,
      inProgressCount,
      focusTime
    });
    return response.data.coaching;
  } catch (err) {
    console.error("getAIProgressCoaching error:", err);
    return "Focus on the foundation today. Every step is structural progress.";
  }
};
export const getProductivitySuggestions = async (tasks) => {
  try {
    const response = await api.post("/ai/suggestions", { tasks });
    return response.data;
  } catch (err) {
    console.error("getProductivitySuggestions error:", err);
    return [
      { title: "Batch Core Tasks", description: "Group similar activities to reduce cognitive switching costs.", category: "Focus" },
      { title: "Review Blueprint", description: "Take 5 minutes to align your current tasks with your long-term vision.", category: "Organization" },
      { title: "Honor the Flow", description: "Notice when your energy is highest and assign critical work to those windows.", category: "Mindset" }
    ];
  }
};
export const getCombinedDashboardInsight = async (completedCount, todoCount, inProgressCount, focusTime, tasks) => {
  try {
    const response = await api.post("/ai/combined-insight", {
      completedCount,
      todoCount,
      inProgressCount,
      focusTime,
      tasks
    });
    return response.data;
  } catch (err) {
    console.error("getCombinedDashboardInsight error:", err);
    return {
      coaching: "The Architect is observing a pause in data flow. Trust your intuition and core foundation today.",
      suggestions: [
        { title: "Maintain Momentum", description: "Focus on finishing one singular task before starting another.", category: "Focus" },
        { title: "Structural Integrity", description: "Review your task priority level to ensure your energy is directed correctly.", category: "Organization" }
      ]
    };
  }
};
export const getAIRoadmapAndTimetable = async (tasks, startTime, endTime) => {
  try {
    const response = await api.post("/ai/roadmap", { tasks, startTime, endTime });
    return response.data;
  } catch (err) {
    console.error("getAIRoadmapAndTimetable error:", err);
    return {
      vision: "Progress through intentional action.",
      roadmap: [
        { phase: "Structure", goal: "Address high-affinity tasks first." },
        { phase: "Flow", goal: "Maintain steady output mid-day." },
        { phase: "Review", goal: "Calibrate for tomorrow." }
      ],
      timetable: [
        { time: "09:00", activity: "Foundation Tasks", vibe: "Determined" },
        { time: "14:00", activity: "Structural Maintenance", vibe: "Steady" }
      ]
    };
  }
};
export const chatWithArchitect = async (message, tasks, history) => {
  try {
    const response = await api.post("/ai/chat", { message, tasks, history });
    return response.data.text;
  } catch (err) {
    console.error("chatWithArchitect error:", err);
    return "Building blocks are still aligning. Please try again.";
  }
};
