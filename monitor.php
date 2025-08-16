<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Monitoring configuration
$monitorConfig = [
    'scan_interval' => 5, // seconds
    'alert_threshold' => 1, // number of threats to trigger alert
    'max_log_entries' => 1000,
    'auto_quarantine' => false
];

// Load hack clients database
function loadHackDatabase() {
    $dbFile = 'data/hack_clients.json';
    if (file_exists($dbFile)) {
        $data = json_decode(file_get_contents($dbFile), true);
        return $data['hack_clients'] ?? [];
    }
    return [];
}

// Load monitoring logs
function loadMonitoringLogs() {
    $logFile = 'data/monitoring_logs.json';
    if (file_exists($logFile)) {
        return json_decode(file_get_contents($logFile), true) ?? [];
    }
    return [];
}

// Save monitoring logs
function saveMonitoringLogs($logs) {
    $logFile = 'data/monitoring_logs.json';
    if (!file_exists('data')) {
        mkdir('data', 0755, true);
    }
    return file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
}

// Add log entry
function addLogEntry($type, $message, $data = null) {
    $logs = loadMonitoringLogs();
    $entry = [
        'id' => uniqid(),
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => $type, // 'info', 'warning', 'threat', 'error'
        'message' => $message,
        'data' => $data
    ];
    
    array_unshift($logs, $entry);
    
    // Keep only last 1000 entries
    global $monitorConfig;
    if (count($logs) > $monitorConfig['max_log_entries']) {
        $logs = array_slice($logs, 0, $monitorConfig['max_log_entries']);
    }
    
    saveMonitoringLogs($logs);
    return $entry;
}

// Real-time process scanning
function performRealTimeScan() {
    $hackClients = loadHackDatabase();
    $results = [
        'timestamp' => date('Y-m-d H:i:s'),
        'minecraft_processes' => [],
        'threats_detected' => [],
        'system_status' => 'clean',
        'scan_duration' => 0
    ];
    
    $startTime = microtime(true);
    
    // Scan for Minecraft processes
    $output = shell_exec('tasklist /fo csv 2>nul');
    if ($output) {
        $lines = explode("\n", $output);
        foreach ($lines as $line) {
            if (stripos($line, 'minecraft') !== false || 
                stripos($line, 'javaw.exe') !== false ||
                stripos($line, 'java.exe') !== false) {
                
                $data = str_getcsv($line);
                if (count($data) >= 5) {
                    $process = [
                        'name' => $data[0],
                        'pid' => $data[1],
                        'memory' => $data[4],
                        'dlls_checked' => 0,
                        'threats' => []
                    ];
                    
                    // Check loaded DLLs for this process
                    $command = "powershell \"Get-Process -Id {$process['pid']} -Module 2>\\$null | Select-Object ModuleName\"";
                    $dllOutput = shell_exec($command);
                    
                    if ($dllOutput) {
                        $dllLines = explode("\n", trim($dllOutput));
                        foreach ($dllLines as $dllLine) {
                            $dllName = strtolower(trim($dllLine));
                            if (strpos($dllName, '.dll') !== false) {
                                $process['dlls_checked']++;
                                
                                // Check against hack client database
                                foreach ($hackClients as $hackClient) {
                                    if (!$hackClient['active']) continue;
                                    
                                    foreach ($hackClient['file_signatures'] as $signature) {
                                        if (stripos($dllName, strtolower($signature)) !== false) {
                                            $threat = [
                                                'hack_client' => $hackClient['name'],
                                                'threat_level' => $hackClient['threat_level'],
                                                'description' => $hackClient['description'],
                                                'detected_file' => $dllName,
                                                'process_pid' => $process['pid'],
                                                'detection_time' => date('H:i:s')
                                            ];
                                            
                                            $process['threats'][] = $threat;
                                            $results['threats_detected'][] = $threat;
                                            
                                            // Log the threat
                                            addLogEntry('threat', "Hack client detected: {$hackClient['name']}", $threat);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    $results['minecraft_processes'][] = $process;
                }
            }
        }
    }
    
    // Check for suspicious executables
    $suspiciousExes = ['nitr0.exe', 'cheat_engine.exe', 'injector.exe', 'process_hacker.exe'];
    foreach ($suspiciousExes as $exe) {
        $checkCmd = "tasklist /fi \"imagename eq $exe\" 2>nul | find /i \"$exe\"";
        $exeResult = shell_exec($checkCmd);
        if ($exeResult && trim($exeResult)) {
            $threat = [
                'hack_client' => $exe,
                'threat_level' => 'HIGH',
                'description' => 'Suspicious executable detected',
                'detected_file' => $exe,
                'process_pid' => 'unknown',
                'detection_time' => date('H:i:s')
            ];
            
            $results['threats_detected'][] = $threat;
            addLogEntry('threat', "Suspicious executable detected: $exe", $threat);
        }
    }
    
    // Update system status
    if (count($results['threats_detected']) > 0) {
        $results['system_status'] = 'threat_detected';
        addLogEntry('warning', "System compromised: " . count($results['threats_detected']) . " threats detected");
    } else {
        $results['system_status'] = 'clean';
    }
    
    $results['scan_duration'] = round((microtime(true) - $startTime) * 1000, 2);
    
    return $results;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'start_monitoring':
            $_SESSION['monitoring_active'] = true;
            $_SESSION['monitoring_start_time'] = time();
            addLogEntry('info', 'Real-time monitoring started');
            echo json_encode(['success' => true, 'message' => 'Monitoring dimulai']);
            exit;
            
        case 'stop_monitoring':
            $_SESSION['monitoring_active'] = false;
            addLogEntry('info', 'Real-time monitoring stopped');
            echo json_encode(['success' => true, 'message' => 'Monitoring dihentikan']);
            exit;
            
        case 'get_status':
            $isActive = $_SESSION['monitoring_active'] ?? false;
            $startTime = $_SESSION['monitoring_start_time'] ?? 0;
            $uptime = $isActive ? (time() - $startTime) : 0;
            
            echo json_encode([
                'monitoring_active' => $isActive,
                'uptime' => $uptime,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit;
            
        case 'real_time_scan':
            $scanResults = performRealTimeScan();
            echo json_encode($scanResults);
            exit;
            
        case 'get_logs':
            $logs = loadMonitoringLogs();
            $limit = intval($_POST['limit'] ?? 50);
            echo json_encode(array_slice($logs, 0, $limit));
            exit;
            
        case 'clear_logs':
            saveMonitoringLogs([]);
            addLogEntry('info', 'Monitoring logs cleared');
            echo json_encode(['success' => true, 'message' => 'Logs berhasil dihapus']);
            exit;
    }
}

$pageTitle = "Real-time Monitor - Minecraft Hack Detector";
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

        .monitor-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
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
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .status-active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-inactive {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-threat {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
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
        }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .btn-warning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }

        .monitor-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .stat-item {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }

        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 4px;
        }

        .stat-label {
            color: #94a3b8;
            font-size: 0.75rem;
        }

        .threat-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            display: none;
        }

        .threat-alert.active {
            display: block;
            animation: pulse 2s infinite;
        }

        .process-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .process-item {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .process-info {
            flex: 1;
        }

        .process-name {
            font-weight: 600;
            color: #f1f5f9;
            font-size: 0.875rem;
        }

        .process-details {
            color: #94a3b8;
            font-size: 0.75rem;
        }

        .threat-badge {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .log-container {
            max-height: 400px;
            overflow-y: auto;
        }

        .log-entry {
            padding: 8px 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            font-size: 0.875rem;
        }

        .log-entry:last-child {
            border-bottom: none;
        }

        .log-timestamp {
            color: #64748b;
            font-size: 0.75rem;
        }

        .log-message {
            color: #e2e8f0;
            margin-top: 2px;
        }

        .log-info { border-left: 3px solid #3b82f6; }
        .log-warning { border-left: 3px solid #f59e0b; }
        .log-threat { border-left: 3px solid #ef4444; }
        .log-error { border-left: 3px solid #dc2626; }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .controls {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        @media (max-width: 768px) {
            .monitor-grid {
                grid-template-columns: 1fr;
            }
            
            .header {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
            
            .controls {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-radar"></i> Real-time Monitor</h1>
            <div class="nav-links">
                <a href="index.php"><i class="fas fa-home"></i> Dashboard</a>
                <a href="scanner.php"><i class="fas fa-search"></i> Scanner</a>
                <a href="database.php"><i class="fas fa-database"></i> Database</a>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-power-off"></i>
                    Monitor Control
                </div>
                <div id="monitor-status" class="status-indicator status-inactive">
                    <i class="fas fa-circle"></i>
                    <span>Inactive</span>
                </div>
            </div>
            
            <div class="controls">
                <button id="start-monitor" class="btn btn-primary">
                    <i class="fas fa-play"></i>
                    Start Monitoring
                </button>
                <button id="stop-monitor" class="btn btn-danger" style="display: none;">
                    <i class="fas fa-stop"></i>
                    Stop Monitoring
                </button>
                <button id="clear-logs" class="btn btn-warning">
                    <i class="fas fa-trash"></i>
                    Clear Logs
                </button>
            </div>

            <div class="monitor-stats" id="monitor-stats">
                <div class="stat-item">
                    <div class="stat-number" id="uptime">0</div>
                    <div class="stat-label">Uptime (seconds)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="processes-monitored">0</div>
                    <div class="stat-label">Processes Monitored</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="threats-detected">0</div>
                    <div class="stat-label">Threats Detected</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="scan-duration">0ms</div>
                    <div class="stat-label">Last Scan Duration</div>
                </div>
            </div>
        </div>

        <div class="monitor-grid">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-desktop"></i>
                        Live Process Monitor
                    </div>
                </div>
                
                <div id="threat-alert" class="threat-alert">
                    <h4 style="color: #ef4444; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        THREAT DETECTED!
                    </h4>
                    <div id="threat-details"></div>
                </div>

                <div class="process-list" id="process-list">
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>Start monitoring to see live processes</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-list"></i>
                        Activity Log
                    </div>
                </div>
                
                <div class="log-container" id="log-container">
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>No activity logs yet</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let monitoringActive = false;
        let monitorInterval;
        let statusInterval;
        let logInterval;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            checkMonitorStatus();
            loadLogs();
        });

        // Start monitoring
        document.getElementById('start-monitor').addEventListener('click', function() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=start_monitoring'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    startMonitoring();
                }
            });
        });

        // Stop monitoring
        document.getElementById('stop-monitor').addEventListener('click', function() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=stop_monitoring'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    stopMonitoring();
                }
            });
        });

        // Clear logs
        document.getElementById('clear-logs').addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all logs?')) {
                fetch('monitor.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=clear_logs'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadLogs();
                    }
                });
            }
        });

        function startMonitoring() {
            monitoringActive = true;
            updateUI();
            
            // Start real-time scanning
            monitorInterval = setInterval(performRealTimeScan, 5000);
            
            // Start status updates
            statusInterval = setInterval(updateStatus, 1000);
            
            // Start log updates
            logInterval = setInterval(loadLogs, 10000);
            
            // Perform initial scan
            performRealTimeScan();
        }

        function stopMonitoring() {
            monitoringActive = false;
            updateUI();
            
            if (monitorInterval) clearInterval(monitorInterval);
            if (statusInterval) clearInterval(statusInterval);
            if (logInterval) clearInterval(logInterval);
        }

        function updateUI() {
            const statusEl = document.getElementById('monitor-status');
            const startBtn = document.getElementById('start-monitor');
            const stopBtn = document.getElementById('stop-monitor');

            if (monitoringActive) {
                statusEl.className = 'status-indicator status-active pulse';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Active</span>';
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-flex';
            } else {
                statusEl.className = 'status-indicator status-inactive';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Inactive</span>';
                startBtn.style.display = 'inline-flex';
                stopBtn.style.display = 'none';
            }
        }

        function performRealTimeScan() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=real_time_scan'
            })
            .then(response => response.json())
            .then(data => {
                updateProcessList(data);
                updateStats(data);
                checkThreats(data);
            });
        }

        function updateProcessList(data) {
            const processList = document.getElementById('process-list');
            
            if (data.minecraft_processes.length === 0) {
                processList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>No Minecraft processes detected</p>
                        <small>Scan time: ${data.timestamp}</small>
                    </div>
                `;
                return;
            }

            let html = '';
            data.minecraft_processes.forEach(process => {
                const threatCount = process.threats.length;
                const threatBadge = threatCount > 0 ? 
                    `<span class="threat-badge">${threatCount} threats</span>` : '';

                html += `
                    <div class="process-item">
                        <div class="process-info">
                            <div class="process-name">${process.name}</div>
                            <div class="process-details">
                                PID: ${process.pid} | Memory: ${process.memory} | DLLs: ${process.dlls_checked}
                            </div>
                        </div>
                        ${threatBadge}
                    </div>
                `;
            });

            processList.innerHTML = html;
        }

        function updateStats(data) {
            document.getElementById('processes-monitored').textContent = data.minecraft_processes.length;
            document.getElementById('threats-detected').textContent = data.threats_detected.length;
            document.getElementById('scan-duration').textContent = data.scan_duration + 'ms';
        }

        function checkThreats(data) {
            const threatAlert = document.getElementById('threat-alert');
            const threatDetails = document.getElementById('threat-details');

            if (data.threats_detected.length > 0) {
                threatAlert.classList.add('active');
                
                let html = '';
                data.threats_detected.forEach(threat => {
                    html += `
                        <div style="margin-bottom: 8px;">
                            <strong>${threat.hack_client}</strong> (${threat.threat_level})
                            <br><small>File: ${threat.detected_file} | PID: ${threat.process_pid}</small>
                        </div>
                    `;
                });
                
                threatDetails.innerHTML = html;
            } else {
                threatAlert.classList.remove('active');
            }
        }

        function updateStatus() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_status'
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('uptime').textContent = data.uptime;
            });
        }

        function checkMonitorStatus() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_status'
            })
            .then(response => response.json())
            .then(data => {
                if (data.monitoring_active) {
                    startMonitoring();
                }
            });
        }

        function loadLogs() {
            fetch('monitor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_logs&limit=20'
            })
            .then(response => response.json())
            .then(logs => {
                const logContainer = document.getElementById('log-container');
                
                if (logs.length === 0) {
                    logContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #94a3b8;">
                            <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 16px;"></i>
                            <p>No activity logs yet</p>
                        </div>
                    `;
                    return;
                }

                let html = '';
                logs.forEach(log => {
                    html += `
                        <div class="log-entry log-${log.type}">
                            <div class="log-timestamp">${log.timestamp}</div>
                            <div class="log-message">${log.message}</div>
                        </div>
                    `;
                });

                logContainer.innerHTML = html;
            });
        }
    </script>
</body>
</html>
