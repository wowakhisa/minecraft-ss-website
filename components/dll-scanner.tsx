"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Scan, Shield, AlertTriangle, CheckCircle, XCircle, Search, Clock, Hash } from "lucide-react"

interface DLLInfo {
  name: string
  path: string
  size: number
  version: string
  company: string
  description: string
  hash: string
  loadTime: Date
  riskLevel: "safe" | "suspicious" | "dangerous"
  category: "system" | "game" | "unknown" | "hack"
  signatures: string[]
}

interface DLLScannerProps {
  isActive: boolean
  minecraftPid?: number
  onScanComplete: (results: { total: number; suspicious: number; dangerous: number }) => void
}

export function DLLScanner({ isActive, minecraftPid, onScanComplete }: DLLScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [dlls, setDlls] = useState<DLLInfo[]>([])
  const [filteredDlls, setFilteredDlls] = useState<DLLInfo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [lastScan, setLastScan] = useState<Date | null>(null)

  const mockDlls: DLLInfo[] = [
    {
      name: "kernel32.dll",
      path: "C:\\Windows\\System32\\kernel32.dll",
      size: 1024000,
      version: "10.0.19041.1",
      company: "Microsoft Corporation",
      description: "Windows NT BASE API Client DLL",
      hash: "a1b2c3d4e5f6...",
      loadTime: new Date(Date.now() - 1000 * 60 * 5),
      riskLevel: "safe",
      category: "system",
      signatures: ["Microsoft Signed", "System DLL"],
    },
    {
      name: "user32.dll",
      path: "C:\\Windows\\System32\\user32.dll",
      size: 2048000,
      version: "10.0.19041.1",
      company: "Microsoft Corporation",
      description: "Multi-User Windows USER API Client DLL",
      hash: "b2c3d4e5f6a1...",
      loadTime: new Date(Date.now() - 1000 * 60 * 4),
      riskLevel: "safe",
      category: "system",
      signatures: ["Microsoft Signed", "System DLL"],
    },
    {
      name: "xinput1_4.dll",
      path: "C:\\Windows\\System32\\xinput1_4.dll",
      size: 512000,
      version: "10.0.19041.1",
      company: "Microsoft Corporation",
      description: "Microsoft Common Controller API",
      hash: "c3d4e5f6a1b2...",
      loadTime: new Date(Date.now() - 1000 * 60 * 3),
      riskLevel: "safe",
      category: "game",
      signatures: ["Microsoft Signed", "Gaming API"],
    },
    {
      name: "horion.dll",
      path: "C:\\Users\\User\\AppData\\Roaming\\horion\\horion.dll",
      size: 2048000,
      version: "2.3.1",
      company: "Unknown",
      description: "Horion Minecraft Hack Client",
      hash: "h0r10n_h4ck_c1...",
      loadTime: new Date(Date.now() - 1000 * 60 * 2),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Horion Client", "Memory Injection"],
    },
    {
      name: "nitr0.exe",
      path: "C:\\Users\\User\\Desktop\\nitr0\\nitr0.exe",
      size: 1536000,
      version: "1.0.0",
      company: "Unknown",
      description: "Nitr0 Minecraft Hack Client",
      hash: "n1tr0_h4ck_ex3...",
      loadTime: new Date(Date.now() - 1000 * 60 * 1),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Nitr0 Client", "Process Injection"],
    },
    {
      name: "impact.dll",
      path: "C:\\Users\\User\\.minecraft\\mods\\impact\\impact.dll",
      size: 3072000,
      version: "4.9.1",
      company: "Impact Development",
      description: "Impact Minecraft Client",
      hash: "1mp4ct_cl13nt_d...",
      loadTime: new Date(Date.now() - 1000 * 30),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Impact Client", "Mod Injection"],
    },
    {
      name: "wurst.dll",
      path: "C:\\Users\\User\\AppData\\Roaming\\.minecraft\\wurst\\wurst.dll",
      size: 1800000,
      version: "7.35.2",
      company: "Wurst Client",
      description: "Wurst Minecraft Hack Client",
      hash: "wur5t_cl13nt_dl...",
      loadTime: new Date(Date.now() - 1000 * 45),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Wurst Client", "Memory Manipulation"],
    },
    {
      name: "aristois.dll",
      path: "C:\\Users\\User\\AppData\\Roaming\\.minecraft\\aristois\\aristois.dll",
      size: 2560000,
      version: "1.19.4",
      company: "Aristois",
      description: "Aristois Minecraft Utility Mod",
      hash: "4r15t015_m0d_dl...",
      loadTime: new Date(Date.now() - 1000 * 60),
      riskLevel: "suspicious",
      category: "hack",
      signatures: ["Utility Mod", "Unsigned", "Aristois Client", "Game Modification"],
    },
    {
      name: "meteor.dll",
      path: "C:\\Users\\User\\.minecraft\\mods\\meteor\\meteor.dll",
      size: 2200000,
      version: "0.5.4",
      company: "MeteorDevelopment",
      description: "Meteor Client for Minecraft",
      hash: "m3t30r_cl13nt_d...",
      loadTime: new Date(Date.now() - 1000 * 75),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Meteor Client", "Fabric Mod"],
    },
    {
      name: "liquidbounce.dll",
      path: "C:\\Users\\User\\AppData\\Roaming\\.minecraft\\liquidbounce\\liquidbounce.dll",
      size: 2800000,
      version: "1.19.2",
      company: "CCBlueX",
      description: "LiquidBounce Minecraft Client",
      hash: "l1qu1db0unc3_dl...",
      loadTime: new Date(Date.now() - 1000 * 90),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "LiquidBounce Client", "Kotlin Based"],
    },
    {
      name: "sigma.dll",
      path: "C:\\Users\\User\\Desktop\\Sigma\\sigma.dll",
      size: 1920000,
      version: "5.0.1",
      company: "Unknown",
      description: "Sigma Minecraft Hack Client",
      hash: "51gm4_h4ck_cl13...",
      loadTime: new Date(Date.now() - 1000 * 105),
      riskLevel: "dangerous",
      category: "hack",
      signatures: ["Known Hack Client", "Unsigned", "Sigma Client", "Jello Fork"],
    },
    {
      name: "overlay_injector.dll",
      path: "C:\\Users\\User\\AppData\\Local\\Temp\\overlay_injector.dll",
      size: 256000,
      version: "1.0.0.0",
      company: "Unknown",
      description: "Suspicious Overlay Injector",
      hash: "0v3rl4y_1nj3ct0r...",
      loadTime: new Date(Date.now() - 1000 * 120),
      riskLevel: "suspicious",
      category: "unknown",
      signatures: ["Unsigned", "Temp Directory", "Injection Tool", "Memory Manipulation"],
    },
  ]

  const startScan = async () => {
    if (!isActive || !minecraftPid) return

    setIsScanning(true)
    setScanProgress(0)
    setLastScan(new Date())
    setDlls([])

    // Simulate progressive scanning
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setScanProgress(i)

      // Add DLLs progressively
      if (i >= 20 && i <= 100) {
        const dllIndex = Math.floor((i - 20) / 16)
        if (dllIndex < mockDlls.length) {
          setDlls((prev) => [...prev, mockDlls[dllIndex]])
        }
      }
    }

    setIsScanning(false)

    // Calculate results
    const suspicious = mockDlls.filter((dll) => dll.riskLevel === "suspicious").length
    const dangerous = mockDlls.filter((dll) => dll.riskLevel === "dangerous").length

    onScanComplete({
      total: mockDlls.length,
      suspicious,
      dangerous,
    })
  }

  useEffect(() => {
    let filtered = dlls

    if (searchTerm) {
      filtered = filtered.filter(
        (dll) =>
          dll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dll.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dll.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      if (selectedCategory === "threats") {
        filtered = filtered.filter((dll) => dll.riskLevel === "suspicious" || dll.riskLevel === "dangerous")
      } else {
        filtered = filtered.filter((dll) => dll.category === selectedCategory)
      }
    }

    setFilteredDlls(filtered)
  }, [dlls, searchTerm, selectedCategory])

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "safe":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "dangerous":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "safe":
        return "default"
      case "suspicious":
        return "secondary"
      case "dangerous":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    return `${kb.toFixed(1)} KB`
  }

  const getCategoryStats = () => {
    const stats = {
      all: dlls.length,
      system: dlls.filter((dll) => dll.category === "system").length,
      game: dlls.filter((dll) => dll.category === "game").length,
      unknown: dlls.filter((dll) => dll.category === "unknown").length,
      hack: dlls.filter((dll) => dll.category === "hack").length,
      threats: dlls.filter((dll) => dll.riskLevel === "suspicious" || dll.riskLevel === "dangerous").length,
    }
    return stats
  }

  const stats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Scan Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">DLL Scanner</h3>
        </div>
        <div className="flex items-center gap-2">
          {lastScan && (
            <span className="text-sm text-muted-foreground">Last scan: {lastScan.toLocaleTimeString()}</span>
          )}
          <Button
            onClick={startScan}
            disabled={isScanning || !isActive || !minecraftPid}
            className="flex items-center gap-2"
          >
            <Scan className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Start DLL Scan"}
          </Button>
        </div>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning loaded DLLs...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {dlls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("all")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.all}</div>
                <div className="text-sm text-muted-foreground">Total DLLs</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("threats")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.threats}</div>
                <div className="text-sm text-muted-foreground">Threats</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("system")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.system}</div>
                <div className="text-sm text-muted-foreground">System</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("game")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.game}</div>
                <div className="text-sm text-muted-foreground">Game</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("unknown")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{stats.unknown}</div>
                <div className="text-sm text-muted-foreground">Unknown</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCategory("hack")}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.hack}</div>
                <div className="text-sm text-muted-foreground">Hack Clients</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      {dlls.length > 0 && (
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search DLLs by name, company, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* DLL List */}
      {filteredDlls.length > 0 ? (
        <div className="space-y-3">
          {filteredDlls.map((dll, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                dll.riskLevel === "dangerous"
                  ? "border-l-red-500"
                  : dll.riskLevel === "suspicious"
                    ? "border-l-yellow-500"
                    : "border-l-green-500"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(dll.riskLevel)}
                    <CardTitle className="text-lg">{dll.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(dll.riskLevel)}>{dll.riskLevel.toUpperCase()}</Badge>
                    <Badge variant="outline">{dll.category.toUpperCase()}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{dll.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{dll.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{formatFileSize(dll.size)}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{dll.description}</p>
                </div>

                {/* Path */}
                <div>
                  <p className="text-sm text-muted-foreground">Path</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{dll.path}</p>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Hash (MD5)
                    </p>
                    <p className="font-mono text-xs bg-muted p-2 rounded">{dll.hash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Load Time
                    </p>
                    <p className="font-medium">{dll.loadTime.toLocaleString()}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div>
                  <p className="text-sm text-muted-foreground">Signatures</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dll.signatures.map((sig, sigIndex) => (
                      <Badge key={sigIndex} variant="outline" className="text-xs">
                        {sig}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dlls.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No DLLs match your filters</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
          </CardContent>
        </Card>
      ) : !isScanning ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scan className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No scan results available</p>
            <p className="text-sm text-muted-foreground mb-4">
              {!isActive
                ? "Start screen sharing to enable DLL scanning"
                : !minecraftPid
                  ? "Minecraft process not detected"
                  : "Click 'Start DLL Scan' to analyze loaded libraries"}
            </p>
            {isActive && minecraftPid && (
              <Button onClick={startScan}>
                <Scan className="h-4 w-4 mr-2" />
                Start DLL Scan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
