import api from "./api";
export const notificationService = {
  async getNotifications() {
    const response = await api.get("/notifications");
    return response.data;
  },
  async markAsRead(id) {
    await api.put(`/notifications/${id}/read`);
  },
  async markAllAsRead() {
    await api.put("/notifications/read-all");
  }
};
