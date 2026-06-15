import api from "./api";
export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/signin", { username, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },
  async getProfile() {
    const response = await api.get("/user/profile");
    return response.data;
  },
  async updateProfile(profileData) {
    const response = await api.put("/user/profile", profileData);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    return response.data;
  },
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/user/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.avatarUrl = response.data.avatarUrl;
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
    return response.data.avatarUrl;
  },
  async getAllUsersAdmin() {
    const response = await api.get("/user/admin/all");
    return response.data;
  },
  async register(username, password) {
    const response = await api.post("/auth/signup", { username, password });
    return response.data;
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
};
