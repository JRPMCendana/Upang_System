import { useState, useCallback, useEffect } from "react"
import { courseService, type Course } from "@/services/course-service"
import { useToast } from "@/hooks/use-toast"

interface UseCoursesOptions {
  filters?: Record<string, any>
  autoFetch?: boolean
}

export function useCourses(options: UseCoursesOptions = {}) {
  const { filters, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Fetch courses
  const fetchCourses = useCallback(async (customFilters?: Record<string, any>) => {
    const targetFilters = customFilters ?? filters

    if (courses.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await courseService.getCourses(targetFilters)
      setCourses(response as Course[])
    } catch (error: any) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [filters, courses.length, toast])

  // Fetch single course
  const fetchCourseById = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await courseService.getCourseById(id)
      setSelectedCourse(response as Course)
      return response as Course
    } catch (error: any) {
      console.error("Error fetching course:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch course details",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Create course
  const createCourse = useCallback(async (data: Partial<Course>) => {
    setLoading(true)
    try {
      await courseService.createCourse(data)

      toast({
        title: "Success",
        description: "Course created successfully!",
      })

      // Refresh courses
      await fetchCourses()
      return true
    } catch (error: any) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchCourses])

  // Update course
  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    setLoading(true)
    try {
      await courseService.updateCourse(id, data)

      toast({
        title: "Success",
        description: "Course updated successfully!",
      })

      // Refresh courses
      await fetchCourses()
      return true
    } catch (error: any) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchCourses])

  // Delete course
  const deleteCourse = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await courseService.deleteCourse(id)

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      })

      // Refresh courses
      await fetchCourses()
      return true
    } catch (error: any) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchCourses])

  // Enroll in course
  const enrollCourse = useCallback(async (courseId: string) => {
    setLoading(true)
    try {
      await courseService.enrollCourse(courseId)

      toast({
        title: "Success",
        description: "Successfully enrolled in course!",
      })

      // Refresh courses
      await fetchCourses()
      return true
    } catch (error: any) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchCourses])

  // Refresh all data
  const refreshCourses = useCallback(async () => {
    await fetchCourses()
  }, [fetchCourses])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCourses()
    }
  }, [autoFetch, fetchCourses])

  return {
    // State
    courses,
    loading,
    initialLoading,
    selectedCourse,

    // Actions
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    refreshCourses,
    setSelectedCourse,
  }
}
