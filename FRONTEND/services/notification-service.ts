// Notification Service

import { apiClient } from "./api-client"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "assignment" | "deadline" | "grade" | "announcement"
  read: boolean
  createdAt: string
}

class NotificationService {
  async getNotifications(limit = 10) {
    return apiClient.request<Notification[]>("/notifications", {
      params: { limit },
    })
  }

  async markAsRead(id: string) {
    return apiClient.request(`/notifications/${id}/read`, {
      method: "PUT",
    })
  }

  async markAllAsRead() {
    return apiClient.request("/notifications/read-all", {
      method: "PUT",
    })
  }

  async deleteNotification(id: string) {
    return apiClient.request(`/notifications/${id}`, {
      method: "DELETE",
    })
  }
}

export const notificationService = new NotificationService()
