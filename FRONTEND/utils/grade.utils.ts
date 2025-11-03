// Grade Utility Functions

import type { Grade } from "@/types/grade.types"

/**
 * Calculate average grade from an array of grades
 * @param grades - Array of grade objects or numbers
 * @returns Average grade (0-100)
 */
export function calculateAverage(grades: Grade[] | number[]): number {
  if (grades.length === 0) return 0

  // If array contains Grade objects
  if (typeof grades[0] === "object" && grades[0] !== null && "score" in grades[0]) {
    const gradeObjects = grades as Grade[]
    const sum = gradeObjects.reduce((acc, g) => acc + (g.score || 0), 0)
    return Math.round((sum / gradeObjects.length) * 10) / 10
  }

  // If array contains numbers
  const numbers = grades as number[]
  const sum = numbers.reduce((acc, g) => acc + g, 0)
  return Math.round((sum / numbers.length) * 10) / 10
}

/**
 * Get letter grade from numeric score
 * @param score - Numeric score (0-100)
 * @param scale - Grading scale (default: "standard")
 * @returns Letter grade (A, B, C, D, F)
 */
export function getLetterGrade(
  score: number,
  scale: "standard" | "strict" | "lenient" = "standard"
): string {
  // Standard scale: A=90+, B=80+, C=70+, D=60+, F=<60
  // Strict scale: A=93+, B=85+, C=77+, D=70+, F=<70
  // Lenient scale: A=85+, B=75+, C=65+, D=55+, F=<55

  if (scale === "strict") {
    if (score >= 93) return "A"
    if (score >= 85) return "B"
    if (score >= 77) return "C"
    if (score >= 70) return "D"
    return "F"
  }

  if (scale === "lenient") {
    if (score >= 85) return "A"
    if (score >= 75) return "B"
    if (score >= 65) return "C"
    if (score >= 55) return "D"
    return "F"
  }

  // Standard scale (default)
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

/**
 * Get detailed letter grade with +/- modifiers
 * @param score - Numeric score (0-100)
 * @returns Letter grade with modifiers (A+, A, A-, etc.)
 */
export function getDetailedLetterGrade(score: number): string {
  if (score >= 97) return "A+"
  if (score >= 93) return "A"
  if (score >= 90) return "A-"
  if (score >= 87) return "B+"
  if (score >= 83) return "B"
  if (score >= 80) return "B-"
  if (score >= 77) return "C+"
  if (score >= 73) return "C"
  if (score >= 70) return "C-"
  if (score >= 67) return "D+"
  if (score >= 63) return "D"
  if (score >= 60) return "D-"
  return "F"
}

/**
 * Get grade status (passing or failing)
 * @param score - Numeric score (0-100)
 * @param passingScore - Minimum passing score (default: 60)
 * @returns "passing" or "failing"
 */
export function getGradeStatus(score: number, passingScore: number = 60): "passing" | "failing" {
  return score >= passingScore ? "passing" : "failing"
}

/**
 * Calculate GPA from grades
 * @param grades - Array of grade objects
 * @param scale - GPA scale (default: "4.0")
 * @returns GPA value
 */
export function calculateGPA(grades: Grade[], scale: "4.0" | "5.0" = "4.0"): number {
  if (grades.length === 0) return 0

  const gradePoints = grades.map((g) => {
    const score = g.score || 0
    const letter = getLetterGrade(score)
    return letterToGPA(letter, scale)
  })

  const sum = gradePoints.reduce((acc, gp) => acc + gp, 0)
  return Math.round((sum / gradePoints.length) * 100) / 100
}

/**
 * Convert letter grade to GPA points
 * @param letter - Letter grade (A, B, C, D, F)
 * @param scale - GPA scale (default: "4.0")
 * @returns GPA points
 */
export function letterToGPA(letter: string, scale: "4.0" | "5.0" = "4.0"): number {
  const baseGPA = scale === "4.0" ? 4.0 : 5.0
  const letterBase = letter.charAt(0)

  switch (letterBase) {
    case "A":
      return baseGPA
    case "B":
      return baseGPA * 0.75
    case "C":
      return baseGPA * 0.5
    case "D":
      return baseGPA * 0.25
    default:
      return 0
  }
}

/**
 * Get grade distribution from array of grades
 * @param grades - Array of grade objects or numbers
 * @returns Distribution object with counts for each letter grade
 */
export function getGradeDistribution(grades: Grade[] | number[]): {
  A: number
  B: number
  C: number
  D: number
  F: number
  total: number
} {
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0, total: grades.length }

  grades.forEach((item) => {
    const score = typeof item === "number" ? item : item.score || 0
    const letter = getLetterGrade(score)
    distribution[letter as keyof Omit<typeof distribution, "total">]++
  })

  return distribution
}

/**
 * Calculate weighted grade
 * @param grades - Array of objects with grade and weight
 * @returns Weighted average grade
 */
export function calculateWeightedGrade(
  grades: Array<{ grade: number; weight: number }>
): number {
  if (grades.length === 0) return 0

  const totalWeight = grades.reduce((acc, g) => acc + g.weight, 0)
  if (totalWeight === 0) return 0

  const weightedSum = grades.reduce((acc, g) => acc + g.grade * g.weight, 0)
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

/**
 * Check if student is on honor roll
 * @param gpa - Student's GPA
 * @param scale - GPA scale (default: "4.0")
 * @returns true if on honor roll
 */
export function isHonorRoll(gpa: number, scale: "4.0" | "5.0" = "4.0"): boolean {
  const threshold = scale === "4.0" ? 3.5 : 4.375 // 87.5% of max scale
  return gpa >= threshold
}

/**
 * Check if student is on dean's list
 * @param gpa - Student's GPA
 * @param scale - GPA scale (default: "4.0")
 * @returns true if on dean's list
 */
export function isDeansList(gpa: number, scale: "4.0" | "5.0" = "4.0"): boolean {
  const threshold = scale === "4.0" ? 3.75 : 4.6875 // 93.75% of max scale
  return gpa >= threshold
}

/**
 * Get grade improvement suggestion
 * @param currentGrade - Current grade (0-100)
 * @param targetGrade - Target grade (0-100)
 * @param remainingAssignments - Number of remaining assignments
 * @returns Required average for remaining assignments
 */
export function getRequiredAverage(
  currentGrade: number,
  targetGrade: number,
  remainingAssignments: number
): {
  required: number
  achievable: boolean
  message: string
} {
  if (remainingAssignments === 0) {
    return {
      required: 0,
      achievable: false,
      message: "No remaining assignments to improve grade",
    }
  }

  const required = targetGrade + (targetGrade - currentGrade) * remainingAssignments
  const achievable = required <= 100

  if (!achievable) {
    return {
      required,
      achievable: false,
      message: `Target grade not achievable. Need ${Math.round(required)}% average on remaining assignments.`,
    }
  }

  return {
    required: Math.round(required),
    achievable: true,
    message: `Need ${Math.round(required)}% average on remaining ${remainingAssignments} assignment${remainingAssignments > 1 ? "s" : ""} to reach ${targetGrade}%`,
  }
}

/**
 * Calculate grade statistics
 * @param grades - Array of grade objects or numbers
 * @returns Statistics object
 */
export function calculateGradeStats(grades: Grade[] | number[]): {
  average: number
  median: number
  highest: number
  lowest: number
  passing: number
  failing: number
  standardDeviation: number
} {
  if (grades.length === 0) {
    return {
      average: 0,
      median: 0,
      highest: 0,
      lowest: 0,
      passing: 0,
      failing: 0,
      standardDeviation: 0,
    }
  }

  // Extract numeric scores
  const scores =
    typeof grades[0] === "number"
      ? (grades as number[])
      : (grades as Grade[]).map((g) => g.score || 0)

  // Sort scores for median calculation
  const sortedScores = [...scores].sort((a, b) => a - b)

  // Calculate median
  const median =
    scores.length % 2 === 0
      ? (sortedScores[scores.length / 2 - 1] + sortedScores[scores.length / 2]) / 2
      : sortedScores[Math.floor(scores.length / 2)]

  // Calculate average
  const average = calculateAverage(grades)

  // Get highest and lowest
  const highest = Math.max(...scores)
  const lowest = Math.min(...scores)

  // Count passing and failing
  const passing = scores.filter((s) => s >= 60).length
  const failing = scores.filter((s) => s < 60).length

  // Calculate standard deviation
  const squaredDiffs = scores.map((score) => Math.pow(score - average, 2))
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / scores.length
  const standardDeviation = Math.sqrt(avgSquaredDiff)

  return {
    average: Math.round(average * 10) / 10,
    median: Math.round(median * 10) / 10,
    highest,
    lowest,
    passing,
    failing,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
  }
}

/**
 * Get percentile rank for a grade
 * @param grade - Grade to rank
 * @param allGrades - Array of all grades to compare against
 * @returns Percentile (0-100)
 */
export function getPercentileRank(grade: number, allGrades: number[]): number {
  if (allGrades.length === 0) return 0

  const lowerCount = allGrades.filter((g) => g < grade).length
  const percentile = (lowerCount / allGrades.length) * 100

  return Math.round(percentile)
}

/**
 * Format grade with symbol
 * @param grade - Numeric grade
 * @param format - Format type
 * @returns Formatted grade string
 */
export function formatGrade(grade: number, format: "percent" | "letter" | "both" = "percent"): string {
  switch (format) {
    case "percent":
      return `${Math.round(grade)}%`
    case "letter":
      return getLetterGrade(grade)
    case "both":
      return `${Math.round(grade)}% (${getLetterGrade(grade)})`
    default:
      return `${Math.round(grade)}%`
  }
}
