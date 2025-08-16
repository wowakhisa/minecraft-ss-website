"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Cpu, MemoryStick, Clock, RefreshCw, AlertCircle } from "lucide-react"

interface MinecraftProcess {
  pid: number
  name: string
  memoryUsage: number
  cpuUsage: number
  startTime: Date
  status: "running" | "suspended" | "not-responding"
  windowTitle: string
  version: string
}

interface MinecraftProcessMonitorProps {
  isMonitoring: boolean
  onProcessDetected: (detected: boolean) => void
}

export function MinecraftProcessMonitor({ isMonitoring, onProcessDetected }: MinecraftProcessMonitorProps) {
  const [processes, setProcesses] = useState<MinecraftProcess[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<Date | null>(null)

  const scanForMinecraft = async () => {
    setIsScanning(true)
    setLastScan(new Date())

    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock Minecraft processes (in real implementation, this would use system APIs)
    const mockProcesses: MinecraftProcess[] = [
      {
        pid: 12345,
        name: "Minecraft.Windows.exe",
        memoryUsage: 1024 * 1024 * 512, // 512 MB
        cpuUsage: 15.5,
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: "running",
        windowTitle: "Minecraft",
        version: "1.20.81.01",
      },
    ]

    // Randomly decide if Minecraft is detected (for demo purposes)
    const detected = Math.random() > 0.3
    const detectedProcesses = detected ? mockProcesses : []

    setProcesses(detectedProcesses)
    onProcessDetected(detected)
    setIsScanning(false)
  }

  useEffect(() => {
    if (isMonitoring) {
      scanForMinecraft()
      const interval = setInterval(scanForMinecraft, 10000) // Scan every 10 seconds
      return () => clearInterval(interval)
    } else {
      setProcesses([])
      onProcessDetected(false)
    }
  }, [isMonitoring])

  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatUptime = (startTime: Date) => {
    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${remainingMinutes}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "suspended":
        return "bg-yellow-500"
      case "not-responding":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "running":
        return "default"
      case "suspended":
        return "secondary"
      case "not-responding":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {/* Scan Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Minecraft Process Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {lastScan && (
            <span className="text-sm text-muted-foreground">Last scan: {lastScan.toLocaleTimeString()}</span>
          )}
          <Button onClick={scanForMinecraft} disabled={isScanning || !isMonitoring} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Process List */}
      {processes.length > 0 ? (
        <div className="grid gap-4">
          {processes.map((process) => (
            <Card key={process.pid} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    {process.name}
                  </CardTitle>
                  <Badge variant={getStatusVariant(process.status)}>
                    {process.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Process Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PID</p>
                      <p className="font-semibold">{process.pid}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded">
                      <MemoryStick className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <p className="font-semibold">{formatMemoryUsage(process.memoryUsage)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPU</p>
                      <p className="font-semibold">{process.cpuUsage}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="font-semibold">{formatUptime(process.startTime)}</p>
                    </div>
                  </div>
                </div>

                {/* CPU Usage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{process.cpuUsage}%</span>
                  </div>
                  <Progress value={process.cpuUsage} className="h-2" />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Window Title</p>
                    <p className="font-medium">{process.windowTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{process.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            {isScanning ? (
              <>
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-lg font-medium">Scanning for Minecraft processes...</p>
                <p className="text-sm text-muted-foreground">This may take a few seconds</p>
              </>
            ) : isMonitoring ? (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Minecraft processes detected</p>
                <p className="text-sm text-muted-foreground mb-4">Make sure Minecraft Windows 10 Edition is running</p>
                <Button onClick={scanForMinecraft} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Again
                </Button>
              </>
            ) : (
              <>
                <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Process monitoring disabled</p>
                <p className="text-sm text-muted-foreground">Start screen sharing to begin monitoring</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
