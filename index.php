<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Initialize scan status
if (!isset($_SESSION['scan_active'])) {
    $_SESSION['scan_active'] = false;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'start_scan':
            $_SESSION['scan_active'] = true;
            echo json_encode(['success' => true, 'message' => 'Scanning dimulai']);
            exit;
            
        case 'stop_scan':
            $_SESSION['scan_active'] = false;
            echo json_encode(['success' => true, 'message' => 'Scanning dihentikan']);
            exit;
            
        case 'get_status':
            echo json_encode([
                'scan_active' => $_SESSION['scan_active'],
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minecraft Hack Client Detector</title>
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
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }

        .header p {
            color: #94a3b8;
            font-size: 1.1rem;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }

        .card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .card-icon.scan { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .card-icon.process { background: linear-gradient(135deg, #10b981, #059669); }
        .card-icon.threat { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .card-icon.report { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
        }

        .card-content {
            color: #94a3b8;
            margin-bottom: 20px;
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

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
        }

        .control-panel {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
        }

        .control-panel h2 {
            color: #f1f5f9;
            margin-bottom: 16px;
            font-size: 1.5rem;
        }

        .control-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 20px;
        }

        .stat-item {
            text-align: center;
            padding: 16px;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #3b82f6;
        }

        .stat-label {
            color: #94a3b8;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-shield-alt"></i> Minecraft Hack Client Detector</h1>
            <p>Sistem Deteksi Hack Client untuk Minecraft Windows 10 Edition</p>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon scan">
                        <i class="fas fa-search"></i>
                    </div>
                    <div>
                        <div class="card-title">Scanner Status</div>
                    </div>
                </div>
                <div class="card-content">
                    <div id="scan-status" class="status-indicator status-inactive">
                        <i class="fas fa-circle"></i>
                        <span>Tidak Aktif</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number" id="processes-scanned">0</div>
                            <div class="stat-label">Proses Dipindai</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="dlls-checked">0</div>
                            <div class="stat-label">DLL Diperiksa</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon process">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <div>
                        <div class="card-title">Minecraft Process</div>
                    </div>
                </div>
                <div class="card-content">
                    <div id="minecraft-status" class="status-indicator status-inactive">
                        <i class="fas fa-circle"></i>
                        <span>Tidak Terdeteksi</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number" id="minecraft-pid">-</div>
                            <div class="stat-label">Process ID</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="minecraft-memory">0 MB</div>
                            <div class="stat-label">Memory Usage</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon threat">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <div class="card-title">Threat Detection</div>
                    </div>
                </div>
                <div class="card-content">
                    <div id="threat-status" class="status-indicator status-active">
                        <i class="fas fa-shield-alt"></i>
                        <span>Sistem Aman</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number" id="threats-found">0</div>
                            <div class="stat-label">Ancaman Ditemukan</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="last-scan">Belum Pernah</div>
                            <div class="stat-label">Scan Terakhir</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon report">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <div class="card-title">Laporan</div>
                    </div>
                </div>
                <div class="card-content">
                    <p>Akses laporan deteksi dan riwayat scanning</p>
                    <div style="margin-top: 16px;">
                        <a href="reports.php" class="btn btn-primary">
                            <i class="fas fa-file-alt"></i>
                            Lihat Laporan
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="control-panel">
            <h2>Kontrol Scanning</h2>
            <p style="color: #94a3b8; margin-bottom: 24px;">
                Mulai atau hentikan proses scanning untuk mendeteksi hack client
            </p>
            <div class="control-buttons">
                <button id="start-scan" class="btn btn-primary">
                    <i class="fas fa-play"></i>
                    Mulai Scanning
                </button>
                <button id="stop-scan" class="btn btn-danger" style="display: none;">
                    <i class="fas fa-stop"></i>
                    Hentikan Scanning
                </button>
                <a href="scanner.php" class="btn btn-primary">
                    <i class="fas fa-search-plus"></i>
                    Scanner Detail
                </a>
            </div>
        </div>
    </div>

    <script>
        let scanInterval;
        let statsInterval;

        // Update status display
        function updateScanStatus(active) {
            const statusEl = document.getElementById('scan-status');
            const startBtn = document.getElementById('start-scan');
            const stopBtn = document.getElementById('stop-scan');

            if (active) {
                statusEl.className = 'status-indicator status-active pulse';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Aktif Scanning</span>';
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-flex';
                startStatsUpdate();
            } else {
                statusEl.className = 'status-indicator status-inactive';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Tidak Aktif</span>';
                startBtn.style.display = 'inline-flex';
                stopBtn.style.display = 'none';
                stopStatsUpdate();
            }
        }

        // Start scanning
        document.getElementById('start-scan').addEventListener('click', function() {
            fetch('index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=start_scan'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateScanStatus(true);
                }
            });
        });

        // Stop scanning
        document.getElementById('stop-scan').addEventListener('click', function() {
            fetch('index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=stop_scan'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateScanStatus(false);
                }
            });
        });

        // Update statistics
        function startStatsUpdate() {
            let processCount = 0;
            let dllCount = 0;
            
            statsInterval = setInterval(() => {
                processCount += Math.floor(Math.random() * 3) + 1;
                dllCount += Math.floor(Math.random() * 8) + 2;
                
                document.getElementById('processes-scanned').textContent = processCount;
                document.getElementById('dlls-checked').textContent = dllCount;
                
                // Simulate Minecraft detection
                if (Math.random() > 0.7) {
                    const minecraftStatus = document.getElementById('minecraft-status');
                    minecraftStatus.className = 'status-indicator status-active';
                    minecraftStatus.innerHTML = '<i class="fas fa-circle"></i><span>Terdeteksi</span>';
                    
                    document.getElementById('minecraft-pid').textContent = Math.floor(Math.random() * 10000) + 1000;
                    document.getElementById('minecraft-memory').textContent = (Math.random() * 500 + 100).toFixed(0) + ' MB';
                }
                
                document.getElementById('last-scan').textContent = new Date().toLocaleTimeString('id-ID');
            }, 2000);
        }

        function stopStatsUpdate() {
            if (statsInterval) {
                clearInterval(statsInterval);
            }
        }

        // Check initial status
        fetch('index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=get_status'
        })
        .then(response => response.json())
        .then(data => {
            updateScanStatus(data.scan_active);
        });
    </script>
</body>
</html>
