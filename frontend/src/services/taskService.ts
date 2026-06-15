import api from './api';
import { Task } from '../types';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const taskService = {
  async getMyTasks(page = 0, size = 10): Promise<PageResponse<Task>> {
    const response = await api.get<PageResponse<Task>>(`/tasks?page=${page}&size=${size}`);
    return response.data;
  },

  async createTask(task: Task): Promise<Task> {
    const { user, User, createdAt, updatedAt, ...cleanTask } = task as any;
    const response = await api.post<Task>('/tasks', cleanTask);
    return response.data;
  },

  async updateTask(id: number, task: Task): Promise<Task> {
    const { user, User, createdAt, updatedAt, ...cleanTask } = task as any;
    const response = await api.put<Task>(`/tasks/${id}`, cleanTask);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getAllTasksAdmin(page = 0, size = 10): Promise<PageResponse<Task>> {
    const response = await api.get<PageResponse<Task>>(`/tasks/admin/all?page=${page}&size=${size}`);
    return response.data;
  }
};

export interface Category {
  id: number;
  name: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  async createCategory(name: string): Promise<Category> {
    const response = await api.post<Category>('/categories', { name });
    return response.data;
  }
};
