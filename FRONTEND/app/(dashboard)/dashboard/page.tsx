"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { BarChart3, BookOpen, FileText, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <motion.div 
            className="max-w-7xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
              <p className="text-text-secondary">Here's your learning overview for this week.</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              className="grid md:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Active Courses</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <BookOpen className="w-10 h-10 text-primary/20" />
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Pending Assignments</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <FileText className="w-10 h-10 text-accent/20" />
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Average Grade</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <BarChart3 className="w-10 h-10 text-warning/20" />
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold">72%</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-danger/20" />
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Assignments</h2>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div>
                        <p className="font-medium">Introduction to Math {i}</p>
                        <p className="text-sm text-text-secondary">Due in {5 - i} days</p>
                      </div>
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Pending</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
