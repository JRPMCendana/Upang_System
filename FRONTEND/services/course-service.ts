// Course Management Service

import { apiClient } from "./api-client"

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  enrollmentCount: number
  progress: number
  createdAt: string
}

class CourseService {
  async getCourses(filters?: Record<string, any>) {
    return apiClient.request<Course[]>("/courses", {
      params: filters,
    })
  }

  async getCourseById(id: string) {
    return apiClient.request(`/courses/${id}`)
  }

  async createCourse(data: Partial<Course>) {
    return apiClient.request("/courses", {
      method: "POST",
      body: data,
    })
  }

  async updateCourse(id: string, data: Partial<Course>) {
    return apiClient.request(`/courses/${id}`, {
      method: "PUT",
      body: data,
    })
  }

  async deleteCourse(id: string) {
    return apiClient.request(`/courses/${id}`, {
      method: "DELETE",
    })
  }

  async enrollCourse(courseId: string) {
    return apiClient.request(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  }
}

export const courseService = new CourseService()
