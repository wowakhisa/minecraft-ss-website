"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Settings,
  Monitor,
  Bell,
  Database,
  Shield,
  Download,
  Upload,
  Trash2,
  Info,
  Save,
  RotateCcw,
} from "lucide-react"

interface MonitoringSettings {
  autoStart: boolean
  monitorInterval: number
  enableSystemApps: boolean
  enableBackgroundApps: boolean
  maxLogEntries: number
  dataRetentionDays: number
  enableCrashDetection: boolean
  enableMemoryMonitoring: boolean
}

interface AppFilter {
  id: string
  name: string
  processName: string
  action: "monitor" | "ignore"
  isSystem: boolean
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<MonitoringSettings>({
    autoStart: true,
    monitorInterval: 2,
    enableSystemApps: false,
    enableBackgroundApps: true,
    maxLogEntries: 10000,
    dataRetentionDays: 30,
    enableCrashDetection: true,
    enableMemoryMonitoring: true,
  })

  const [appFilters, setAppFilters] = useState<AppFilter[]>([
    { id: "1", name: "Google Chrome", processName: "chrome.exe", action: "monitor", isSystem: false },
    { id: "2", name: "Windows Explorer", processName: "explorer.exe", action: "ignore", isSystem: true },
    { id: "3", name: "System Idle Process", processName: "System", action: "ignore", isSystem: true },
    { id: "4", name: "Visual Studio Code", processName: "Code.exe", action: "monitor", isSystem: false },
    { id: "5", name: "Windows Security", processName: "SecurityHealthSystray.exe", action: "ignore", isSystem: true },
  ])

  const [newFilterName, setNewFilterName] = useState("")
  const [newFilterProcess, setNewFilterProcess] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  const updateSetting = <K extends keyof MonitoringSettings>(key: K, value: MonitoringSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const addAppFilter = () => {
    if (newFilterName && newFilterProcess) {
      const newFilter: AppFilter = {
        id: Date.now().toString(),
        name: newFilterName,
        processName: newFilterProcess,
        action: "monitor",
        isSystem: false,
      }
      setAppFilters((prev) => [...prev, newFilter])
      setNewFilterName("")
      setNewFilterProcess("")
    }
  }

  const updateAppFilter = (id: string, action: "monitor" | "ignore") => {
    setAppFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, action } : filter)))
  }

  const removeAppFilter = (id: string) => {
    setAppFilters((prev) => prev.filter((filter) => filter.id !== id))
  }

  const exportSettings = () => {
    const exportData = {
      settings,
      appFilters,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pcaclient-settings-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetSettings = () => {
    setSettings({
      autoStart: true,
      monitorInterval: 2,
      enableSystemApps: false,
      enableBackgroundApps: true,
      maxLogEntries: 10000,
      dataRetentionDays: 30,
      enableCrashDetection: true,
      enableMemoryMonitoring: true,
    })
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all monitoring data? This action cannot be undone.")) {
      // In a real app, this would clear the database
      console.log("Clearing all monitoring data...")
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "monitoring", label: "Monitoring", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data & Storage", icon: Database },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">System Configuration</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === "general" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-start monitoring</Label>
                    <p className="text-sm text-muted-foreground">Start monitoring when the application launches</p>
                  </div>
                  <Switch
                    checked={settings.autoStart}
                    onCheckedChange={(checked) => updateSetting("autoStart", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Monitoring interval (seconds)</Label>
                  <Select
                    value={settings.monitorInterval.toString()}
                    onValueChange={(value) => updateSetting("monitorInterval", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Monitor system applications</Label>
                    <p className="text-sm text-muted-foreground">Include Windows system processes</p>
                  </div>
                  <Switch
                    checked={settings.enableSystemApps}
                    onCheckedChange={(checked) => updateSetting("enableSystemApps", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Monitor background applications</Label>
                    <p className="text-sm text-muted-foreground">Track apps running in the background</p>
                  </div>
                  <Switch
                    checked={settings.enableBackgroundApps}
                    onCheckedChange={(checked) => updateSetting("enableBackgroundApps", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Crash detection</Label>
                    <p className="text-sm text-muted-foreground">Detect and log application crashes</p>
                  </div>
                  <Switch
                    checked={settings.enableCrashDetection}
                    onCheckedChange={(checked) => updateSetting("enableCrashDetection", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Memory usage monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track memory consumption of applications</p>
                  </div>
                  <Switch
                    checked={settings.enableMemoryMonitoring}
                    onCheckedChange={(checked) => updateSetting("enableMemoryMonitoring", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Application name"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                  />
                  <Input
                    placeholder="Process name (e.g., chrome.exe)"
                    value={newFilterProcess}
                    onChange={(e) => setNewFilterProcess(e.target.value)}
                  />
                  <Button onClick={addAppFilter}>Add Filter</Button>
                </div>

                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {appFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{filter.name}</p>
                            <p className="text-sm text-muted-foreground">{filter.processName}</p>
                          </div>
                          {filter.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={filter.action}
                            onValueChange={(value: "monitor" | "ignore") => updateAppFilter(filter.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monitor">Monitor</SelectItem>
                              <SelectItem value="ignore">Ignore</SelectItem>
                            </SelectContent>
                          </Select>
                          {!filter.isSystem && (
                            <Button variant="ghost" size="sm" onClick={() => removeAppFilter(filter.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum log entries</Label>
                  <Input
                    type="number"
                    value={settings.maxLogEntries}
                    onChange={(e) => updateSetting("maxLogEntries", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Older entries will be automatically deleted when this limit is reached
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Data retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => updateSetting("dataRetentionDays", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">Automatically delete data older than this many days</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Data Management Actions</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportSettings}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </Button>
                    <Button variant="destructive" onClick={clearAllData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Database Size</p>
                    <p className="text-2xl font-bold">2.4 MB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Events</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Oldest Entry</p>
                    <p className="text-sm text-muted-foreground">15 days ago</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Cleanup</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Privacy Notice</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      All monitoring data is stored locally on your device. No data is transmitted to external servers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Data Collection</Label>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Application names and process information</li>
                      <li>• Launch and close timestamps</li>
                      <li>• Memory usage statistics</li>
                      <li>• System uptime information</li>
                    </ul>
                  </div>

                  <div>
                    <Label className="text-base">Data Storage</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      All data is stored in a local SQLite database on your computer. The database file is located in
                      your user profile directory.
                    </p>
                  </div>

                  <div>
                    <Label className="text-base">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      PC Client Monitor does not share any data with third parties. All monitoring information remains
                      on your local device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
