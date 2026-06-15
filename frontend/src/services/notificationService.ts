import api from './api';

export interface TaskNotification {
  id: number;
  message: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'DUE_SOON';
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<TaskNotification[]> {
    const response = await api.get<TaskNotification[]>('/notifications');
    return response.data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
};
