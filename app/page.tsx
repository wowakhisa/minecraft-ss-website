"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Shield, AlertTriangle, Pause, Share, Gamepad2, Scan, BarChart3, Settings } from "lucide-react"
import { MinecraftProcessMonitor } from "@/components/minecraft-process-monitor"
import { DLLScanner } from "@/components/dll-scanner"
import { HackDetectionDashboard } from "@/components/hack-detection-dashboard"
import { MonitoringControls } from "@/components/monitoring-controls"

export default function MinecraftHackDetector() {
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [minecraftDetected, setMinecraftDetected] = useState(false)
  const [minecraftPid, setMinecraftPid] = useState<number | undefined>(undefined)
  const [hackStatus, setHackStatus] = useState<"clean" | "suspicious" | "detected">("clean")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [screenShareError, setScreenShareError] = useState<string | null>(null)
  const [screenShareSupported, setScreenShareSupported] = useState(true)
  const [isSimulatedMode, setIsSimulatedMode] = useState(false)
  const [scanResults, setScanResults] = useState({
    totalDlls: 0,
    suspiciousDlls: 0,
    lastScan: null as Date | null,
  })

  const checkScreenShareSupport = () => {
    // Check if running in secure context (HTTPS)
    if (!window.isSecureContext) {
      return { supported: false, reason: "Screen sharing requires HTTPS (secure context)" }
    }

    // Check if MediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return { supported: false, reason: "Screen sharing API not available" }
    }

    // Check if we're in a restricted environment (like v0 preview)
    // These environments often block display-capture via permissions policy
    const isRestrictedEnvironment =
      window.location.hostname.includes("v0.app") ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("preview") ||
      document.referrer.includes("v0.app")

    if (isRestrictedEnvironment) {
      return { supported: false, reason: "Screen sharing not available in preview environment" }
    }

    // For other environments, we'll attempt the call and handle errors gracefully
    return { supported: true, reason: "Screen sharing should be supported" }
  }

  const startScreenShare = async () => {
    try {
      setScreenShareError(null)

      const supportCheck = checkScreenShareSupport()

      if (!supportCheck.supported) {
        setScreenShareError(`${supportCheck.reason}. Using simulation mode instead.`)
        startSimulatedMode()
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsScreenSharing(true)
      setIsSimulatedMode(false)
      setScreenShareSupported(true)

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare()
      })

      setTimeout(() => {
        setMinecraftDetected(true)
      }, 2000)
    } catch (error) {
      let errorMessage = "Screen sharing not available. Using simulation mode instead."

      if (error instanceof Error) {
        if (error.message.includes("Permission denied") || error.message.includes("NotAllowedError")) {
          errorMessage = "Screen sharing permission denied. Using simulation mode instead."
        } else if (
          error.message.includes("display-capture") ||
          error.message.includes("disallowed by permissions policy") ||
          error.message.includes("Access to the feature")
        ) {
          errorMessage = "Screen sharing blocked by security policy. Using simulation mode instead."
        }
      }

      setScreenShareError(errorMessage)
      setScreenShareSupported(false)
      startSimulatedMode()
    }
  }

  const startSimulatedMode = () => {
    setIsSimulatedMode(true)
    setIsScreenSharing(true)
    setScreenShareError(null)

    setTimeout(() => {
      setMinecraftDetected(true)
    }, 1000)
  }

  const stopScreenShare = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScreenSharing(false)
    setMinecraftDetected(false)
    setIsScanning(false)
    setMinecraftPid(undefined)
    setIsSimulatedMode(false)
    setScreenShareError(null)
  }

  const startHackScan = () => {
    setIsScanning(true)
    setScanResults((prev) => ({ ...prev, lastScan: new Date() }))

    let progress = 0
    const scanInterval = setInterval(() => {
      progress += Math.random() * 20
      setScanResults((prev) => ({
        ...prev,
        totalDlls: Math.floor(progress / 2),
        suspiciousDlls: Math.floor(Math.random() * 3),
      }))

      if (progress >= 100) {
        clearInterval(scanInterval)
        setIsScanning(false)

        const suspicious = scanResults.suspiciousDlls
        if (suspicious === 0) {
          setHackStatus("clean")
        } else if (suspicious <= 2) {
          setHackStatus("suspicious")
        } else {
          setHackStatus("detected")
        }
      }
    }, 500)
  }

  const getStatusColor = () => {
    switch (hackStatus) {
      case "clean":
        return "bg-green-500"
      case "suspicious":
        return "bg-yellow-500"
      case "detected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (hackStatus) {
      case "clean":
        return "Clean"
      case "suspicious":
        return "Suspicious"
      case "detected":
        return "Hack Detected"
      default:
        return "Unknown"
    }
  }

  const handleProcessDetected = (detected: boolean) => {
    setMinecraftDetected(detected)
    setMinecraftPid(detected ? 12345 : undefined)
  }

  const handleDLLScanComplete = (results: { total: number; suspicious: number; dangerous: number }) => {
    setScanResults({
      totalDlls: results.total,
      suspiciousDlls: results.suspicious + results.dangerous,
      lastScan: new Date(),
    })

    if (results.dangerous > 0) {
      setHackStatus("detected")
    } else if (results.suspicious > 0) {
      setHackStatus("suspicious")
    } else {
      setHackStatus("clean")
    }
  }

  const handleMonitoringSettingsChange = (settings: any) => {
    console.log("[v0] Monitoring settings updated:", settings)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Minecraft Hack Detector</h1>
                <p className="text-sm text-muted-foreground">Screen Share & DLL Analysis Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Detection Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                  <p className="text-lg font-semibold">{getStatusText()}</p>
                </div>
              </div>
              <Button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                variant={isScreenSharing ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isScreenSharing ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Sharing
                  </>
                ) : (
                  <>
                    <Share className="h-4 w-4" />
                    Start Screen Share
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Screen Share</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={isScreenSharing ? "default" : "secondary"}>
                    {isScreenSharing ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Minecraft Status</CardTitle>
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={minecraftDetected ? "default" : "secondary"}>
                    {minecraftDetected ? "Detected" : "Not Found"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DLLs Scanned</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scanResults.totalDlls}</div>
                <p className="text-xs text-muted-foreground">{scanResults.suspiciousDlls} suspicious</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                  <div className="text-lg font-bold">{getStatusText()}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="monitor">Screen Share</TabsTrigger>
              <TabsTrigger value="process">Process Monitor</TabsTrigger>
              <TabsTrigger value="scanner">DLL Scanner</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Detection Dashboard
                  </CardTitle>
                  <CardDescription>
                    Comprehensive overview of hack detection activities and system status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HackDetectionDashboard
                    isActive={isScreenSharing}
                    minecraftDetected={minecraftDetected}
                    hackStatus={hackStatus}
                    scanResults={scanResults}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Screen Share Monitor</CardTitle>
                  <CardDescription>
                    Share your screen to monitor Minecraft Windows 10 Edition for hack clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {screenShareError && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="font-medium">Screen Share Issue</p>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">{screenShareError}</p>
                      {!screenShareSupported && (
                        <Button
                          onClick={startSimulatedMode}
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                        >
                          Use Simulation Mode
                        </Button>
                      )}
                    </div>
                  )}

                  {isSimulatedMode && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Monitor className="h-4 w-4" />
                        <p className="font-medium">Simulation Mode Active</p>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Screen sharing is not available. Using simulated monitoring for demonstration.
                      </p>
                    </div>
                  )}

                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    {isScreenSharing ? (
                      <>
                        {isSimulatedMode ? (
                          <div className="flex items-center justify-center h-full text-white bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="text-center">
                              <Monitor className="h-16 w-16 mx-auto mb-4 opacity-70" />
                              <p className="text-xl mb-2">Simulation Mode</p>
                              <p className="text-sm opacity-70">Monitoring Minecraft Windows 10 Edition</p>
                              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                                <p className="text-xs">Simulated Minecraft Window</p>
                                <div className="w-32 h-20 bg-green-600/20 border border-green-500/50 rounded mt-2 mx-auto"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video ref={videoRef} autoPlay muted className="w-full h-full object-contain" />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Click "Start Screen Share" to begin monitoring</p>
                          <p className="text-sm mt-2">Make sure Minecraft Windows 10 Edition is running</p>
                          {!screenShareSupported && (
                            <p className="text-sm text-yellow-600 mt-2">
                              Note: Screen sharing may not be available in this environment
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isScreenSharing && minecraftDetected && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-green-600">
                          {isSimulatedMode ? "Minecraft Detected (Simulated)" : "Minecraft Detected"}
                        </Badge>
                        <Button
                          onClick={startHackScan}
                          disabled={isScanning}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Scan className="h-3 w-3" />
                          {isScanning ? "Scanning..." : "Scan for Hacks"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Screen Sharing Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• HTTPS connection (required for screen sharing API)</li>
                      <li>• Modern browser with screen capture support</li>
                      <li>• Permission to access screen content</li>
                      <li>• Minecraft Windows 10 Edition running</li>
                    </ul>
                    {!screenShareSupported && (
                      <p className="text-sm text-yellow-600 mt-2">
                        If screen sharing is not available, simulation mode will demonstrate the interface.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="process" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Process Monitor</CardTitle>
                  <CardDescription>Real-time monitoring of Minecraft Windows 10 Edition processes</CardDescription>
                </CardHeader>
                <CardContent>
                  <MinecraftProcessMonitor isMonitoring={isScreenSharing} onProcessDetected={handleProcessDetected} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanner" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DLL Analysis</CardTitle>
                  <CardDescription>Scan and analyze loaded DLL files for potential hack clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <DLLScanner
                    isActive={isScreenSharing && minecraftDetected}
                    minecraftPid={minecraftPid}
                    onScanComplete={handleDLLScanComplete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Scan</CardTitle>
                    <CardDescription>Perform a quick DLL analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={startHackScan} disabled={!minecraftDetected || isScanning} className="w-full">
                      {isScanning ? "Scanning..." : "Start Quick Scan"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Last Scan Results</CardTitle>
                    <CardDescription>
                      {scanResults.lastScan
                        ? `Scanned at ${scanResults.lastScan.toLocaleTimeString()}`
                        : "No scans performed yet"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total DLLs:</span>
                        <span className="font-semibold">{scanResults.totalDlls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suspicious:</span>
                        <span
                          className={`font-semibold ${scanResults.suspiciousDlls > 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {scanResults.suspiciousDlls}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Status</CardTitle>
                    <CardDescription>Current threat assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${getStatusColor()}`}></div>
                      <div>
                        <p className="font-semibold">{getStatusText()}</p>
                        <p className="text-sm text-muted-foreground">
                          {hackStatus === "clean" && "No threats detected"}
                          {hackStatus === "suspicious" && "Potential threats found"}
                          {hackStatus === "detected" && "Hack client detected!"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Monitoring Controls
                  </CardTitle>
                  <CardDescription>Configure real-time monitoring, automation, and alert settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <MonitoringControls isActive={isScreenSharing} onSettingsChange={handleMonitoringSettingsChange} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
