"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, Clock, Bell, Shield, Eye, AlertTriangle, CheckCircle, RotateCcw, Save, Activity } from "lucide-react"

interface MonitoringSettings {
  autoScan: boolean
  scanInterval: number // minutes
  realTimeMonitoring: boolean
  alertThreshold: "low" | "medium" | "high"
  autoResponse: boolean
  notificationSound: boolean
  logLevel: "minimal" | "normal" | "verbose"
  maxLogEntries: number
  autoExport: boolean
  exportInterval: number // hours
}

interface MonitoringControlsProps {
  isActive: boolean
  onSettingsChange: (settings: MonitoringSettings) => void
}

export function MonitoringControls({ isActive, onSettingsChange }: MonitoringControlsProps) {
  const [settings, setSettings] = useState<MonitoringSettings>({
    autoScan: true,
    scanInterval: 5,
    realTimeMonitoring: true,
    alertThreshold: "medium",
    autoResponse: false,
    notificationSound: true,
    logLevel: "normal",
    maxLogEntries: 1000,
    autoExport: false,
    exportInterval: 24,
  })

  const [isAutoScanning, setIsAutoScanning] = useState(false)
  const [nextScanIn, setNextScanIn] = useState(0)
  const [monitoringStats, setMonitoringStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    uptime: "0h 0m",
    lastAction: "System started",
  })

  useEffect(() => {
    let scanTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    if (isActive && settings.autoScan && settings.realTimeMonitoring) {
      setIsAutoScanning(true)
      setNextScanIn(settings.scanInterval * 60) // Convert to seconds

      // Countdown timer
      countdownTimer = setInterval(() => {
        setNextScanIn((prev) => {
          if (prev <= 1) {
            // Trigger scan
            setMonitoringStats((prev) => ({
              ...prev,
              totalScans: prev.totalScans + 1,
              lastAction: `Auto-scan completed at ${new Date().toLocaleTimeString()}`,
            }))
            return settings.scanInterval * 60
          }
          return prev - 1
        })
      }, 1000)

      // Main scan timer
      scanTimer = setInterval(
        () => {
          setMonitoringStats((prev) => ({
            ...prev,
            totalScans: prev.totalScans + 1,
            lastAction: `Auto-scan completed at ${new Date().toLocaleTimeString()}`,
          }))
        },
        settings.scanInterval * 60 * 1000,
      )
    } else {
      setIsAutoScanning(false)
      setNextScanIn(0)
    }

    return () => {
      if (scanTimer) clearInterval(scanTimer)
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, [isActive, settings.autoScan, settings.realTimeMonitoring, settings.scanInterval])

  useEffect(() => {
    const statsTimer = setInterval(() => {
      setMonitoringStats((prev) => ({
        ...prev,
        uptime: "2h 45m", // Mock uptime
      }))
    }, 60000)

    return () => clearInterval(statsTimer)
  }, [])

  const handleSettingChange = (key: keyof MonitoringSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const resetToDefaults = () => {
    const defaultSettings: MonitoringSettings = {
      autoScan: true,
      scanInterval: 5,
      realTimeMonitoring: true,
      alertThreshold: "medium",
      autoResponse: false,
      notificationSound: true,
      logLevel: "normal",
      maxLogEntries: 1000,
      autoExport: false,
      exportInterval: 24,
    }
    setSettings(defaultSettings)
    onSettingsChange(defaultSettings)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getThresholdColor = (threshold: string) => {
    switch (threshold) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></div>
              <div>
                <CardTitle className="text-xl">Real-time Monitoring</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "System active" : "System inactive"} •
                  {isAutoScanning ? ` Next scan in ${formatTime(nextScanIn)}` : " Auto-scan disabled"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats.totalScans}</div>
            <p className="text-xs text-muted-foreground">Automated + Manual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{monitoringStats.threatsBlocked}</div>
            <p className="text-xs text-muted-foreground">Auto-responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats.uptime}</div>
            <p className="text-xs text-muted-foreground">Monitoring active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scanning" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="scanning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Scan Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Scanning</Label>
                  <p className="text-sm text-muted-foreground">Enable periodic automatic DLL scans</p>
                </div>
                <Switch
                  checked={settings.autoScan}
                  onCheckedChange={(checked) => handleSettingChange("autoScan", checked)}
                />
              </div>

              <Separator />

              {/* Scan Interval */}
              <div className="space-y-2">
                <Label className="text-base">Scan Interval</Label>
                <p className="text-sm text-muted-foreground">How often to perform automatic scans (minutes)</p>
                <div className="px-3">
                  <Slider
                    value={[settings.scanInterval]}
                    onValueChange={(value) => handleSettingChange("scanInterval", value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                    disabled={!settings.autoScan}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>1 min</span>
                    <span className="font-medium">{settings.scanInterval} minutes</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Real-time Monitoring */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Real-time Monitoring</Label>
                  <p className="text-sm text-muted-foreground">Monitor process changes in real-time</p>
                </div>
                <Switch
                  checked={settings.realTimeMonitoring}
                  onCheckedChange={(checked) => handleSettingChange("realTimeMonitoring", checked)}
                />
              </div>

              {/* Next Scan Countdown */}
              {isActive && settings.autoScan && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Next automatic scan in:</span>
                    </div>
                    <div className="text-lg font-mono font-bold">{formatTime(nextScanIn)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Threshold */}
              <div className="space-y-2">
                <Label className="text-base">Alert Threshold</Label>
                <p className="text-sm text-muted-foreground">Sensitivity level for threat detection alerts</p>
                <Select
                  value={settings.alertThreshold}
                  onValueChange={(value) => handleSettingChange("alertThreshold", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Low - Only critical threats
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Medium - Suspicious + Critical
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        High - All potential threats
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Notification Sound */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notification Sound</Label>
                  <p className="text-sm text-muted-foreground">Play sound when threats are detected</p>
                </div>
                <Switch
                  checked={settings.notificationSound}
                  onCheckedChange={(checked) => handleSettingChange("notificationSound", checked)}
                />
              </div>

              <Separator />

              {/* Current Threshold Display */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">Current Alert Level:</span>
                  </div>
                  <Badge variant="outline" className={getThresholdColor(settings.alertThreshold)}>
                    {settings.alertThreshold.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {settings.alertThreshold === "low" && "Only critical hack clients will trigger alerts"}
                  {settings.alertThreshold === "medium" && "Suspicious files and hack clients will trigger alerts"}
                  {settings.alertThreshold === "high" && "All potential threats will trigger alerts"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Response */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Response</Label>
                  <p className="text-sm text-muted-foreground">Automatically respond to detected threats</p>
                </div>
                <Switch
                  checked={settings.autoResponse}
                  onCheckedChange={(checked) => handleSettingChange("autoResponse", checked)}
                />
              </div>

              {settings.autoResponse && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Auto-Response Enabled</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    System will automatically terminate suspicious processes and quarantine threat files.
                  </p>
                </div>
              )}

              <Separator />

              {/* Auto Export */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Export</Label>
                  <p className="text-sm text-muted-foreground">Automatically export scan reports</p>
                </div>
                <Switch
                  checked={settings.autoExport}
                  onCheckedChange={(checked) => handleSettingChange("autoExport", checked)}
                />
              </div>

              {/* Export Interval */}
              {settings.autoExport && (
                <div className="space-y-2">
                  <Label className="text-base">Export Interval (hours)</Label>
                  <Input
                    type="number"
                    value={settings.exportInterval}
                    onChange={(e) => handleSettingChange("exportInterval", Number.parseInt(e.target.value) || 24)}
                    min={1}
                    max={168}
                    className="w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Log Level */}
              <div className="space-y-2">
                <Label className="text-base">Logging Level</Label>
                <p className="text-sm text-muted-foreground">Amount of detail in system logs</p>
                <Select value={settings.logLevel} onValueChange={(value) => handleSettingChange("logLevel", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal - Errors only</SelectItem>
                    <SelectItem value="normal">Normal - Standard logging</SelectItem>
                    <SelectItem value="verbose">Verbose - Detailed logging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Max Log Entries */}
              <div className="space-y-2">
                <Label className="text-base">Maximum Log Entries</Label>
                <p className="text-sm text-muted-foreground">Maximum number of log entries to keep</p>
                <Input
                  type="number"
                  value={settings.maxLogEntries}
                  onChange={(e) => handleSettingChange("maxLogEntries", Number.parseInt(e.target.value) || 1000)}
                  min={100}
                  max={10000}
                  step={100}
                  className="w-32"
                />
              </div>

              <Separator />

              {/* Last Action */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Last System Action</span>
                </div>
                <p className="text-sm text-muted-foreground">{monitoringStats.lastAction}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
