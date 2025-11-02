// Quiz Domain Types

export interface Quiz {
  _id: string
  id: string
  courseId: string
  course?: QuizCourse
  title: string
  description?: string
  instructions?: string
  questions: Question[]
  timeLimit: number // in minutes
  passingScore: number // percentage
  totalPoints?: number
  attempts?: number
  maxAttempts?: number
  status: "draft" | "active" | "closed"
  availableFrom?: string
  availableUntil?: string
  shuffleQuestions?: boolean
  showCorrectAnswers?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface QuizCourse {
  _id: string
  title: string
  code?: string
}

export interface Question {
  _id?: string
  id: string
  text: string
  type: "multiple-choice" | "true-false" | "short-answer" | "essay"
  points: number
  options?: QuestionOption[]
  correctAnswer?: string | string[]
  explanation?: string
  order?: number
}

export interface QuestionOption {
  id: string
  text: string
  isCorrect?: boolean
}

export interface QuizAttempt {
  _id: string
  quizId: string
  studentId: string
  student?: AttemptStudent
  startedAt: string
  submittedAt?: string
  answers: QuizAnswer[]
  score: number
  percentage: number
  passed: boolean
  timeSpent?: number // in seconds
  status: "in-progress" | "submitted" | "graded"
  feedback?: string
}

export interface AttemptStudent {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface QuizAnswer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  pointsAwarded?: number
}

export interface CreateQuizData {
  courseId: string
  title: string
  description?: string
  instructions?: string
  questions: Omit<Question, "_id">[]
  timeLimit: number
  passingScore: number
  maxAttempts?: number
  availableFrom?: string
  availableUntil?: string
  shuffleQuestions?: boolean
  showCorrectAnswers?: boolean
}

export interface UpdateQuizData {
  title?: string
  description?: string
  instructions?: string
  questions?: Question[]
  timeLimit?: number
  passingScore?: number
  maxAttempts?: number
  status?: "draft" | "active" | "closed"
  availableFrom?: string
  availableUntil?: string
  shuffleQuestions?: boolean
  showCorrectAnswers?: boolean
}

export interface StartQuizData {
  quizId: string
}

export interface SubmitQuizData {
  quizId: string
  attemptId?: string
  answers: QuizAnswer[]
}

export interface QuizFilters {
  courseId?: string
  status?: "draft" | "active" | "closed"
  availableNow?: boolean
}

export interface GetQuizzesResponse {
  success: boolean
  data: Quiz[]
  pagination?: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface GetQuizResponse {
  success: boolean
  data: Quiz
}

export interface CreateQuizResponse {
  success: boolean
  message: string
  data: Quiz
}

export interface UpdateQuizResponse {
  success: boolean
  message: string
  data: Quiz
}

export interface StartQuizResponse {
  success: boolean
  message: string
  data: QuizAttempt
}

export interface SubmitQuizResponse {
  success: boolean
  message: string
  data: QuizAttempt
}

export interface GetQuizAttemptsResponse {
  success: boolean
  data: QuizAttempt[]
}

// Quiz statistics
export interface QuizStats {
  totalQuizzes: number
  active: number
  completed: number
  averageScore?: number
  highestScore?: number
  lowestScore?: number
  totalAttempts?: number
  passRate?: number
}

// For student quiz taking
export interface QuizQuestion extends Omit<Question, 'correctAnswer'> {
  // Excludes correctAnswer for students
}

export interface StudentQuiz extends Omit<Quiz, 'questions'> {
  questions: QuizQuestion[]
  remainingAttempts?: number
  bestScore?: number
}
