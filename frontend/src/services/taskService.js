import api from "./api";
export const taskService = {
  async getMyTasks(page = 0, size = 10) {
    const response = await api.get(`/tasks?page=${page}&size=${size}`);
    return response.data;
  },
  async createTask(task) {
    const { user, User, createdAt, updatedAt, ...cleanTask } = task;
    const response = await api.post("/tasks", cleanTask);
    return response.data;
  },
  async updateTask(id, task) {
    const { user, User, createdAt, updatedAt, ...cleanTask } = task;
    const response = await api.put(`/tasks/${id}`, cleanTask);
    return response.data;
  },
  async deleteTask(id) {
    await api.delete(`/tasks/${id}`);
  },
  async getAllTasksAdmin(page = 0, size = 10) {
    const response = await api.get(`/tasks/admin/all?page=${page}&size=${size}`);
    return response.data;
  }
};
export const categoryService = {
  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  },
  async createCategory(name) {
    const response = await api.post("/categories", { name });
    return response.data;
  }
};
