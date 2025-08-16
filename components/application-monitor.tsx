"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Monitor, Clock, X, RefreshCw } from "lucide-react"

interface Application {
  id: string
  name: string
  processName: string
  openedAt: Date
  status: "running" | "responding" | "not-responding"
  memoryUsage: string
  icon: string
}

export function ApplicationMonitor({ isMonitoring }: { isMonitoring: boolean }) {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      name: "Google Chrome",
      processName: "chrome.exe",
      openedAt: new Date(Date.now() - 3600000), // 1 hour ago
      status: "running",
      memoryUsage: "245 MB",
      icon: "🌐",
    },
    {
      id: "2",
      name: "Visual Studio Code",
      processName: "Code.exe",
      openedAt: new Date(Date.now() - 7200000), // 2 hours ago
      status: "running",
      memoryUsage: "189 MB",
      icon: "💻",
    },
    {
      id: "3",
      name: "Microsoft Word",
      processName: "WINWORD.EXE",
      openedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      status: "responding",
      memoryUsage: "156 MB",
      icon: "📝",
    },
    {
      id: "4",
      name: "Spotify",
      processName: "Spotify.exe",
      openedAt: new Date(Date.now() - 5400000), // 1.5 hours ago
      status: "running",
      memoryUsage: "98 MB",
      icon: "🎵",
    },
    {
      id: "5",
      name: "Discord",
      processName: "Discord.exe",
      openedAt: new Date(Date.now() - 900000), // 15 minutes ago
      status: "running",
      memoryUsage: "134 MB",
      icon: "💬",
    },
  ])

  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())

      // Randomly add new applications or update existing ones
      if (Math.random() > 0.8) {
        const newApps = [
          { name: "Notepad", processName: "notepad.exe", icon: "📄" },
          { name: "Calculator", processName: "calc.exe", icon: "🧮" },
          { name: "File Explorer", processName: "explorer.exe", icon: "📁" },
          { name: "Task Manager", processName: "taskmgr.exe", icon: "⚙️" },
        ]

        const randomApp = newApps[Math.floor(Math.random() * newApps.length)]
        const newApplication: Application = {
          id: Date.now().toString(),
          name: randomApp.name,
          processName: randomApp.processName,
          openedAt: new Date(),
          status: "running",
          memoryUsage: `${Math.floor(Math.random() * 200 + 50)} MB`,
          icon: randomApp.icon,
        }

        setApplications((prev) => [...prev, newApplication])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getTimeSince = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`
    }
    return `${minutes}m ago`
  }

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "running":
        return "default"
      case "responding":
        return "secondary"
      case "not-responding":
        return "destructive"
      default:
        return "default"
    }
  }

  const removeApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Monitor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Active Applications</h3>
          <Badge variant="outline">{applications.length} running</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {formatTime(lastUpdate)}
          <Button variant="ghost" size="sm" onClick={() => setLastUpdate(new Date())}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Applications List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {applications.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{app.name}</h4>
                      <Badge variant={getStatusColor(app.status)} className="text-xs">
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.processName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatTime(app.openedAt)}</p>
                    <p className="text-xs text-muted-foreground">{getTimeSince(app.openedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.memoryUsage}</p>
                    <p className="text-xs text-muted-foreground">Memory</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeApplication(app.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Monitor Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-4">
          <span>Status: {isMonitoring ? "Monitoring Active" : "Monitoring Stopped"}</span>
          <span>•</span>
          <span>Total Memory: {applications.reduce((sum, app) => sum + Number.parseInt(app.memoryUsage), 0)} MB</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-gray-400"}`} />
          <span>{isMonitoring ? "Live" : "Offline"}</span>
        </div>
      </div>
    </div>
  )
}
