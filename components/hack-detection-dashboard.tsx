"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react"

interface DetectionEvent {
  id: string
  timestamp: Date
  type: "process_detected" | "dll_scan" | "threat_found" | "system_alert"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  details?: any
}

interface ThreatSummary {
  totalThreats: number
  criticalThreats: number
  suspiciousFiles: number
  cleanScans: number
  lastThreatDetected?: Date
}

interface SystemHealth {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkActivity: number
  uptime: string
}

interface HackDetectionDashboardProps {
  isActive: boolean
  minecraftDetected: boolean
  hackStatus: "clean" | "suspicious" | "detected"
  scanResults: {
    totalDlls: number
    suspiciousDlls: number
    lastScan: Date | null
  }
}

export function HackDetectionDashboard({
  isActive,
  minecraftDetected,
  hackStatus,
  scanResults,
}: HackDetectionDashboardProps) {
  const [events, setEvents] = useState<DetectionEvent[]>([])
  const [threatSummary, setThreatSummary] = useState<ThreatSummary>({
    totalThreats: 0,
    criticalThreats: 0,
    suspiciousFiles: 0,
    cleanScans: 0,
  })
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkActivity: 0,
    uptime: "0h 0m",
  })

  useEffect(() => {
    const mockEvents: DetectionEvent[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: "threat_found",
        severity: "critical",
        title: "Hack Client Detected",
        description: "Wurst Client DLL found in Minecraft process",
        details: { dllName: "wurst_client.dll", processId: 12345 },
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        type: "dll_scan",
        severity: "medium",
        title: "Suspicious DLL Found",
        description: "Unsigned overlay.dll detected in temp directory",
        details: { dllName: "overlay.dll", riskLevel: "suspicious" },
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: "process_detected",
        severity: "low",
        title: "Minecraft Process Started",
        description: "Minecraft.Windows.exe detected and monitoring initiated",
        details: { processId: 12345, version: "1.20.81.01" },
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        type: "system_alert",
        severity: "low",
        title: "Monitoring Started",
        description: "Screen sharing activated, system monitoring enabled",
        details: { monitoringMode: "active" },
      },
    ]

    setEvents(mockEvents)

    // Update threat summary based on current status
    setThreatSummary({
      totalThreats: hackStatus === "detected" ? 2 : hackStatus === "suspicious" ? 1 : 0,
      criticalThreats: hackStatus === "detected" ? 1 : 0,
      suspiciousFiles: scanResults.suspiciousDlls,
      cleanScans: hackStatus === "clean" ? 1 : 0,
      lastThreatDetected: hackStatus !== "clean" ? new Date(Date.now() - 1000 * 60 * 5) : undefined,
    })

    // Simulate system health data
    const updateSystemHealth = () => {
      setSystemHealth({
        cpuUsage: Math.random() * 30 + 10,
        memoryUsage: Math.random() * 40 + 30,
        diskUsage: Math.random() * 20 + 60,
        networkActivity: Math.random() * 50 + 10,
        uptime: "2h 34m",
      })
    }

    updateSystemHealth()
    const healthInterval = setInterval(updateSystemHealth, 5000)

    return () => clearInterval(healthInterval)
  }, [hackStatus, scanResults, minecraftDetected])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getOverallStatus = () => {
    if (!isActive) return { status: "inactive", color: "bg-gray-500", text: "Inactive" }
    if (hackStatus === "detected") return { status: "threat", color: "bg-red-500", text: "Threat Detected" }
    if (hackStatus === "suspicious") return { status: "warning", color: "bg-yellow-500", text: "Suspicious Activity" }
    if (minecraftDetected) return { status: "monitoring", color: "bg-green-500", text: "Monitoring Active" }
    return { status: "waiting", color: "bg-blue-500", text: "Waiting for Minecraft" }
  }

  const overallStatus = getOverallStatus()

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: overallStatus,
      threatSummary,
      systemHealth,
      recentEvents: events.slice(0, 10),
      scanResults,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hack-detection-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${overallStatus.color} animate-pulse`}></div>
              <div>
                <CardTitle className="text-xl">System Status: {overallStatus.text}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "Monitoring active" : "System inactive"} •
                  {minecraftDetected ? " Minecraft detected" : " No Minecraft process"} • Last scan:{" "}
                  {scanResults.lastScan?.toLocaleTimeString() || "Never"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{threatSummary.totalThreats}</div>
                <p className="text-xs text-muted-foreground">{threatSummary.criticalThreats} critical</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspicious Files</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{threatSummary.suspiciousFiles}</div>
                <p className="text-xs text-muted-foreground">Requires investigation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clean Scans</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{threatSummary.cleanScans}</div>
                <p className="text-xs text-muted-foreground">No threats found</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.uptime}</div>
                <p className="text-xs text-muted-foreground">Monitoring active</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col gap-2" disabled={!minecraftDetected}>
                  <Zap className="h-6 w-6" />
                  <span>Quick Scan</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <Eye className="h-6 w-6" />
                  <span>View Logs</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <Download className="h-6 w-6" />
                  <span>Export Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                  <RefreshCw className="h-6 w-6" />
                  <span>Refresh All</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {threatSummary.totalThreats > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold text-red-700">Critical Threat Detected</h4>
                    </div>
                    <p className="text-sm text-red-600">
                      Wurst Client hack detected in Minecraft process. Immediate action required.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="destructive">
                        Terminate Process
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {threatSummary.suspiciousFiles > 0 && (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-semibold text-yellow-700">Suspicious Files Found</h4>
                      </div>
                      <p className="text-sm text-yellow-600">
                        {threatSummary.suspiciousFiles} suspicious DLL files require investigation.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="secondary">
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline">
                          Quarantine
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700">No Threats Detected</h3>
                  <p className="text-sm text-muted-foreground">System is clean and secure</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getSeverityIcon(event.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className="text-xs text-muted-foreground">{event.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      <Badge variant="outline" className={`mt-2 ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{systemHealth.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.cpuUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{systemHealth.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.memoryUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>{systemHealth.diskUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.diskUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Activity</span>
                    <span>{systemHealth.networkActivity.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.networkActivity} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">{systemHealth.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monitoring Status</span>
                  <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Minecraft Status</span>
                  <Badge variant={minecraftDetected ? "default" : "secondary"}>
                    {minecraftDetected ? "Detected" : "Not Found"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Scan</span>
                  <span className="text-sm font-medium">{scanResults.lastScan?.toLocaleTimeString() || "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Threat Level</span>
                  <Badge
                    variant={
                      hackStatus === "detected" ? "destructive" : hackStatus === "suspicious" ? "secondary" : "default"
                    }
                  >
                    {hackStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
