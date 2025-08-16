<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Known hack clients database
$hackClients = [
    // DLL Files
    'horion.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Horion Hack Client'],
    'nitr0.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Nitr0 Hack Client'],
    'wurst.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Wurst Hack Client'],
    'impact.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Impact Hack Client'],
    'aristois.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Aristois Hack Client'],
    'liquidbounce.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'LiquidBounce Hack Client'],
    'sigma.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Sigma Hack Client'],
    'meteor.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Meteor Hack Client'],
    'inertia.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Inertia Hack Client'],
    'konas.dll' => ['type' => 'DLL', 'threat' => 'HIGH', 'description' => 'Konas Hack Client'],
    
    // EXE Files
    'nitr0.exe' => ['type' => 'EXE', 'threat' => 'HIGH', 'description' => 'Nitr0 Hack Client Launcher'],
    'horion_launcher.exe' => ['type' => 'EXE', 'threat' => 'HIGH', 'description' => 'Horion Launcher'],
    'wurst_launcher.exe' => ['type' => 'EXE', 'threat' => 'HIGH', 'description' => 'Wurst Launcher'],
    'cheat_engine.exe' => ['type' => 'EXE', 'threat' => 'MEDIUM', 'description' => 'Cheat Engine'],
    'injector.exe' => ['type' => 'EXE', 'threat' => 'HIGH', 'description' => 'DLL Injector'],
    'process_hacker.exe' => ['type' => 'EXE', 'threat' => 'MEDIUM', 'description' => 'Process Hacker'],
];

// Function to scan for Minecraft processes
function scanMinecraftProcesses() {
    $processes = [];
    
    // Use Windows tasklist command to get processes
    $output = shell_exec('tasklist /fo csv 2>nul');
    if ($output) {
        $lines = explode("\n", $output);
        foreach ($lines as $line) {
            if (stripos($line, 'minecraft') !== false || 
                stripos($line, 'javaw.exe') !== false ||
                stripos($line, 'java.exe') !== false) {
                
                $data = str_getcsv($line);
                if (count($data) >= 5) {
                    $processes[] = [
                        'name' => $data[0],
                        'pid' => $data[1],
                        'session' => $data[2],
                        'memory' => $data[4]
                    ];
                }
            }
        }
    }
    
    return $processes;
}

// Function to get loaded DLLs for a process
function getProcessDLLs($pid) {
    $dlls = [];
    
    // Use PowerShell to get loaded modules
    $command = "powershell \"Get-Process -Id $pid -Module 2>\\$null | Select-Object ModuleName, FileName\"";
    $output = shell_exec($command);
    
    if ($output) {
        $lines = explode("\n", trim($output));
        foreach ($lines as $line) {
            if (stripos($line, '.dll') !== false) {
                $dlls[] = trim($line);
            }
        }
    }
    
    return $dlls;
}

// Function to scan for hack clients
function scanForHackClients() {
    global $hackClients;
    $results = [
        'processes' => [],
        'threats' => [],
        'clean_dlls' => [],
        'scan_time' => date('Y-m-d H:i:s')
    ];
    
    // Scan Minecraft processes
    $minecraftProcesses = scanMinecraftProcesses();
    
    foreach ($minecraftProcesses as $process) {
        $processInfo = [
            'process' => $process,
            'dlls' => [],
            'threats' => []
        ];
        
        // Get DLLs for this process
        $dlls = getProcessDLLs($process['pid']);
        
        foreach ($dlls as $dll) {
            $dllName = strtolower(basename($dll));
            
            if (isset($hackClients[$dllName])) {
                // Threat found
                $threat = [
                    'file' => $dll,
                    'name' => $dllName,
                    'type' => $hackClients[$dllName]['type'],
                    'threat_level' => $hackClients[$dllName]['threat'],
                    'description' => $hackClients[$dllName]['description'],
                    'process_pid' => $process['pid'],
                    'detected_at' => date('H:i:s')
                ];
                
                $processInfo['threats'][] = $threat;
                $results['threats'][] = $threat;
            } else {
                // Clean DLL
                $processInfo['dlls'][] = $dll;
                $results['clean_dlls'][] = $dll;
            }
        }
        
        $results['processes'][] = $processInfo;
    }
    
    return $results;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'scan_now':
            $scanResults = scanForHackClients();
            echo json_encode($scanResults);
            exit;
            
        case 'get_processes':
            $processes = scanMinecraftProcesses();
            echo json_encode($processes);
            exit;
    }
}

$pageTitle = "Process Scanner - Minecraft Hack Detector";
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            color: #e2e8f0;
            min-height: 100vh;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links {
            display: flex;
            gap: 16px;
        }

        .nav-links a {
            color: #94a3b8;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .nav-links a:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .scan-controls {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            text-align: center;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            margin: 0 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }

        .card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .card-icon.process { background: linear-gradient(135deg, #10b981, #059669); }
        .card-icon.threat { background: linear-gradient(135deg, #ef4444, #dc2626); }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
        }

        .process-item, .threat-item {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
        }

        .process-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .process-name {
            font-weight: 600;
            color: #f1f5f9;
        }

        .process-pid {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.875rem;
        }

        .threat-level {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .threat-high {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .threat-medium {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
        }

        .threat-low {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
        }

        .spinner {
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top: 3px solid #3b82f6;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .no-results {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
        }

        .scan-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .scan-info h3 {
            color: #3b82f6;
            margin-bottom: 8px;
        }

        @media (max-width: 768px) {
            .results-grid {
                grid-template-columns: 1fr;
            }
            
            .header {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-search"></i> Process Scanner</h1>
            <div class="nav-links">
                <a href="index.php"><i class="fas fa-home"></i> Dashboard</a>
                <a href="reports.php"><i class="fas fa-file-alt"></i> Reports</a>
            </div>
        </div>

        <div class="scan-info">
            <h3><i class="fas fa-info-circle"></i> Informasi Scanner</h3>
            <p>Scanner ini akan menganalisis proses Minecraft yang sedang berjalan dan memeriksa DLL yang dimuat untuk mendeteksi hack client seperti Horion, Nitr0, Wurst, dan lainnya.</p>
        </div>

        <div class="scan-controls">
            <h2>Kontrol Scanning</h2>
            <p style="color: #94a3b8; margin-bottom: 24px;">
                Klik tombol di bawah untuk memulai scanning proses Minecraft
            </p>
            <button id="scan-now" class="btn btn-primary">
                <i class="fas fa-search"></i>
                Scan Sekarang
            </button>
            <button id="auto-scan" class="btn btn-success">
                <i class="fas fa-sync-alt"></i>
                Auto Scan (30s)
            </button>
            <button id="stop-auto" class="btn btn-danger" style="display: none;">
                <i class="fas fa-stop"></i>
                Stop Auto Scan
            </button>
        </div>

        <div id="scan-results">
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; color: #475569;"></i>
                <h3>Belum Ada Hasil Scanning</h3>
                <p>Klik "Scan Sekarang" untuk memulai proses scanning</p>
            </div>
        </div>
    </div>

    <script>
        let autoScanInterval;

        // Scan now button
        document.getElementById('scan-now').addEventListener('click', function() {
            performScan();
        });

        // Auto scan button
        document.getElementById('auto-scan').addEventListener('click', function() {
            startAutoScan();
        });

        // Stop auto scan button
        document.getElementById('stop-auto').addEventListener('click', function() {
            stopAutoScan();
        });

        function performScan() {
            const resultsDiv = document.getElementById('scan-results');
            
            // Show loading
            resultsDiv.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <h3>Scanning Processes...</h3>
                    <p>Menganalisis proses Minecraft dan DLL yang dimuat</p>
                </div>
            `;

            fetch('scanner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=scan_now'
            })
            .then(response => response.json())
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                resultsDiv.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px; color: #ef4444;"></i>
                        <h3>Error Scanning</h3>
                        <p>Terjadi kesalahan saat melakukan scanning: ${error.message}</p>
                    </div>
                `;
            });
        }

        function displayResults(data) {
            const resultsDiv = document.getElementById('scan-results');
            
            let html = '<div class="results-grid">';
            
            // Processes column
            html += `
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon process">
                            <i class="fas fa-cogs"></i>
                        </div>
                        <div class="card-title">Proses Minecraft (${data.processes.length})</div>
                    </div>
            `;
            
            if (data.processes.length > 0) {
                data.processes.forEach(proc => {
                    html += `
                        <div class="process-item">
                            <div class="process-header">
                                <span class="process-name">${proc.process.name}</span>
                                <span class="process-pid">PID: ${proc.process.pid}</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                Memory: ${proc.process.memory} | DLLs: ${proc.dlls.length} | Threats: ${proc.threats.length}
                            </div>
                        </div>
                    `;
                });
            } else {
                html += '<div class="no-results"><p>Tidak ada proses Minecraft yang terdeteksi</p></div>';
            }
            
            html += '</div>';
            
            // Threats column
            html += `
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon threat">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="card-title">Ancaman Terdeteksi (${data.threats.length})</div>
                    </div>
            `;
            
            if (data.threats.length > 0) {
                data.threats.forEach(threat => {
                    html += `
                        <div class="threat-item">
                            <div class="process-header">
                                <span class="process-name">${threat.name}</span>
                                <span class="threat-level threat-${threat.threat_level.toLowerCase()}">${threat.threat_level}</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 8px;">
                                ${threat.description}
                            </div>
                            <div style="color: #64748b; font-size: 0.75rem;">
                                PID: ${threat.process_pid} | Detected: ${threat.detected_at}
                            </div>
                        </div>
                    `;
                });
            } else {
                html += '<div class="no-results"><p style="color: #10b981;"><i class="fas fa-shield-alt"></i> Tidak ada ancaman terdeteksi</p></div>';
            }
            
            html += '</div></div>';
            
            // Add scan info
            html += `
                <div style="text-align: center; margin-top: 16px; color: #94a3b8; font-size: 0.875rem;">
                    Scan completed at ${data.scan_time} | Total DLLs checked: ${data.clean_dlls.length}
                </div>
            `;
            
            resultsDiv.innerHTML = html;
        }

        function startAutoScan() {
            const autoBtn = document.getElementById('auto-scan');
            const stopBtn = document.getElementById('stop-auto');
            
            autoBtn.style.display = 'none';
            stopBtn.style.display = 'inline-flex';
            
            // Perform initial scan
            performScan();
            
            // Set up interval
            autoScanInterval = setInterval(() => {
                performScan();
            }, 30000);
        }

        function stopAutoScan() {
            const autoBtn = document.getElementById('auto-scan');
            const stopBtn = document.getElementById('stop-auto');
            
            autoBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'none';
            
            if (autoScanInterval) {
                clearInterval(autoScanInterval);
            }
        }
    </script>
</body>
</html>
