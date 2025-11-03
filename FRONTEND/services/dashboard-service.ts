import { apiClient } from "./api-client"
import type { StudentDashboardStats, TeacherDashboardStats } from "@/types/dashboard.types"


class DashboardService {

  
  async getStudentDashboard(): Promise<{ data: StudentDashboardStats }> {

    return apiClient.request<{ data: StudentDashboardStats }>(`/dashboard/student`, {
      method: "GET",
    })
  }


   
  async getTeacherDashboard(): Promise<{ data: TeacherDashboardStats }> {

    return apiClient.request<{ data: TeacherDashboardStats }>(`/dashboard/teacher`, {
      method: "GET",
    })
  }
}

export const dashboardService = new DashboardService()
export type { StudentDashboardStats, TeacherDashboardStats }
