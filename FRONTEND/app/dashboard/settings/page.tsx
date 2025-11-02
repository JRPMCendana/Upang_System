"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orgName, setOrgName] = useState("PHINMA University of Pangasinan")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && user.role !== "admin") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [isAuthenticated, router, user, authLoading])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "admin")) return null

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-text-secondary">Manage system preferences and organization details</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark">Save Changes</Button>
            </div>

            {/* Organization */}
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Organization</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-bg-tertiary flex items-center justify-center overflow-hidden">
                      <Image src="/res/PHINMA-Logo.png" alt="Logo" width={48} height={48} />
                    </div>
                    <Button variant="outline" disabled>Change Logo (placeholder)</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-text-secondary">Send updates about activity and reports</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-text-secondary">Use dark theme for dashboards</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Security</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Two-Factor Authentication</p>
                  <p className="text-sm text-text-secondary">Add an extra layer of security for admin logins</p>
                </div>
                <Switch checked={require2FA} onCheckedChange={setRequire2FA} />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
