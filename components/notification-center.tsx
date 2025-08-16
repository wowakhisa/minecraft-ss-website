"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Bell, BellRing, Check, X, Settings, AlertTriangle, Info, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "app-opened" | "app-closed" | "system-alert" | "info"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  appName?: string
  icon: string
}

interface NotificationSettings {
  appOpened: boolean
  appClosed: boolean
  systemAlerts: boolean
  soundEnabled: boolean
}

export function NotificationCenter({ isMonitoring }: { isMonitoring: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "app-opened",
      title: "Application Opened",
      message: "Google Chrome has been launched",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isRead: false,
      appName: "Google Chrome",
      icon: "🌐",
    },
    {
      id: "2",
      type: "app-closed",
      title: "Application Closed",
      message: "Notepad was terminated",
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      isRead: false,
      appName: "Notepad",
      icon: "📄",
    },
    {
      id: "3",
      type: "system-alert",
      title: "High Memory Usage",
      message: "Chrome is using 512MB of memory",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      isRead: true,
      appName: "Google Chrome",
      icon: "⚠️",
    },
    {
      id: "4",
      type: "info",
      title: "Monitoring Started",
      message: "PC Client Monitor is now tracking applications",
      timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
      isRead: true,
      icon: "ℹ️",
    },
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    appOpened: true,
    appClosed: true,
    systemAlerts: true,
    soundEnabled: false,
  })

  const [showSettings, setShowSettings] = useState(false)

  // Simulate new notifications when monitoring is active
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const notificationTypes = [
          {
            type: "app-opened" as const,
            apps: [
              { name: "Calculator", icon: "🧮" },
              { name: "File Explorer", icon: "📁" },
              { name: "Task Manager", icon: "⚙️" },
            ],
          },
          {
            type: "app-closed" as const,
            apps: [
              { name: "Notepad", icon: "📄" },
              { name: "Paint", icon: "🎨" },
              { name: "Calculator", icon: "🧮" },
            ],
          },
        ]

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const randomApp = randomType.apps[Math.floor(Math.random() * randomType.apps.length)]

        const newNotification: Notification = {
          id: Date.now().toString(),
          type: randomType.type,
          title: randomType.type === "app-opened" ? "Application Opened" : "Application Closed",
          message: `${randomApp.name} ${randomType.type === "app-opened" ? "has been launched" : "was terminated"}`,
          timestamp: new Date(),
          isRead: false,
          appName: randomApp.name,
          icon: randomApp.icon,
        }

        if (
          (randomType.type === "app-opened" && settings.appOpened) ||
          (randomType.type === "app-closed" && settings.appClosed)
        ) {
          setNotifications((prev) => [newNotification, ...prev])
        }
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isMonitoring, settings])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "app-opened":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "app-closed":
        return <X className="h-4 w-4 text-red-500" />
      case "system-alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  if (showSettings) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notification Settings</h3>
          <Button variant="ghost" onClick={() => setShowSettings(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application Opened</p>
                  <p className="text-sm text-muted-foreground">Get notified when apps are launched</p>
                </div>
                <Switch
                  checked={settings.appOpened}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, appOpened: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application Closed</p>
                  <p className="text-sm text-muted-foreground">Get notified when apps are terminated</p>
                </div>
                <Switch
                  checked={settings.appClosed}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, appClosed: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about system issues</p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, systemAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Notifications</p>
                  <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
            Clear all
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">Start monitoring to receive alerts</p>
              </div>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 ${!notification.isRead ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{notification.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Notification Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-4">
          <span>Total: {notifications.length}</span>
          <span>•</span>
          <span>Unread: {unreadCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-gray-400"}`} />
          <span>Notifications {isMonitoring ? "Active" : "Paused"}</span>
        </div>
      </div>
    </div>
  )
}
