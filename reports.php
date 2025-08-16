<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Load monitoring logs
function loadMonitoringLogs() {
    $logFile = 'data/monitoring_logs.json';
    if (file_exists($logFile)) {
        return json_decode(file_get_contents($logFile), true) ?? [];
    }
    return [];
}

// Load hack clients database
function loadHackDatabase() {
    $dbFile = 'data/hack_clients.json';
    if (file_exists($dbFile)) {
        $data = json_decode(file_get_contents($dbFile), true);
        return $data['hack_clients'] ?? [];
    }
    return [];
}

// Generate report data
function generateReportData($startDate = null, $endDate = null) {
    $logs = loadMonitoringLogs();
    $hackClients = loadHackDatabase();
    
    // Filter logs by date range
    if ($startDate && $endDate) {
        $logs = array_filter($logs, function($log) use ($startDate, $endDate) {
            $logDate = date('Y-m-d', strtotime($log['timestamp']));
            return $logDate >= $startDate && $logDate <= $endDate;
        });
    }
    
    $report = [
        'period' => [
            'start' => $startDate ?: 'All time',
            'end' => $endDate ?: 'All time',
            'generated_at' => date('Y-m-d H:i:s')
        ],
        'summary' => [
            'total_events' => count($logs),
            'threat_events' => 0,
            'warning_events' => 0,
            'info_events' => 0,
            'unique_threats' => [],
            'most_detected_threat' => null,
            'threat_trend' => []
        ],
        'threats_by_type' => [],
        'threats_by_day' => [],
        'threat_timeline' => [],
        'system_events' => []
    ];
    
    // Analyze logs
    $threatCounts = [];
    $dailyThreats = [];
    
    foreach ($logs as $log) {
        $logDate = date('Y-m-d', strtotime($log['timestamp']));
        $logHour = date('H', strtotime($log['timestamp']));
        
        // Count by type
        switch ($log['type']) {
            case 'threat':
                $report['summary']['threat_events']++;
                
                // Extract threat info
                if (isset($log['data']['hack_client'])) {
                    $threatName = $log['data']['hack_client'];
                    $report['summary']['unique_threats'][] = $threatName;
                    
                    if (!isset($threatCounts[$threatName])) {
                        $threatCounts[$threatName] = 0;
                    }
                    $threatCounts[$threatName]++;
                    
                    // Daily threats
                    if (!isset($dailyThreats[$logDate])) {
                        $dailyThreats[$logDate] = 0;
                    }
                    $dailyThreats[$logDate]++;
                    
                    // Threat timeline
                    $report['threat_timeline'][] = [
                        'timestamp' => $log['timestamp'],
                        'threat' => $threatName,
                        'threat_level' => $log['data']['threat_level'] ?? 'UNKNOWN',
                        'detected_file' => $log['data']['detected_file'] ?? 'Unknown',
                        'process_pid' => $log['data']['process_pid'] ?? 'Unknown'
                    ];
                }
                break;
                
            case 'warning':
                $report['summary']['warning_events']++;
                break;
                
            case 'info':
                $report['summary']['info_events']++;
                break;
        }
        
        // System events
        if (in_array($log['type'], ['info', 'warning'])) {
            $report['system_events'][] = [
                'timestamp' => $log['timestamp'],
                'type' => $log['type'],
                'message' => $log['message']
            ];
        }
    }
    
    // Process unique threats
    $report['summary']['unique_threats'] = array_unique($report['summary']['unique_threats']);
    
    // Most detected threat
    if (!empty($threatCounts)) {
        arsort($threatCounts);
        $report['summary']['most_detected_threat'] = [
            'name' => array_key_first($threatCounts),
            'count' => reset($threatCounts)
        ];
        
        $report['threats_by_type'] = $threatCounts;
    }
    
    // Threats by day
    ksort($dailyThreats);
    $report['threats_by_day'] = $dailyThreats;
    
    // Generate trend (last 7 days)
    $last7Days = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $last7Days[$date] = $dailyThreats[$date] ?? 0;
    }
    $report['summary']['threat_trend'] = $last7Days;
    
    return $report;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'generate_report':
            $startDate = $_POST['start_date'] ?? null;
            $endDate = $_POST['end_date'] ?? null;
            $report = generateReportData($startDate, $endDate);
            echo json_encode($report);
            exit;
            
        case 'export_csv':
            $startDate = $_POST['start_date'] ?? null;
            $endDate = $_POST['end_date'] ?? null;
            $report = generateReportData($startDate, $endDate);
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="threat_report_' . date('Y-m-d') . '.csv"');
            
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Timestamp', 'Threat Name', 'Threat Level', 'Detected File', 'Process PID']);
            
            foreach ($report['threat_timeline'] as $threat) {
                fputcsv($output, [
                    $threat['timestamp'],
                    $threat['threat'],
                    $threat['threat_level'],
                    $threat['detected_file'],
                    $threat['process_pid']
                ]);
            }
            
            fclose($output);
            exit;
            
        case 'export_json':
            $startDate = $_POST['start_date'] ?? null;
            $endDate = $_POST['end_date'] ?? null;
            $report = generateReportData($startDate, $endDate);
            
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="threat_report_' . date('Y-m-d') . '.json"');
            
            echo json_encode($report, JSON_PRETTY_PRINT);
            exit;
    }
}

$pageTitle = "Reports Dashboard - Minecraft Hack Detector";
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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

        .report-controls {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .controls-grid {
            display: grid;
            grid-template-columns: 1fr 1fr auto auto auto;
            gap: 16px;
            align-items: end;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-label {
            color: #f1f5f9;
            font-weight: 500;
            margin-bottom: 4px;
            font-size: 0.875rem;
        }

        .form-input {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            color: #e2e8f0;
            font-size: 0.875rem;
        }

        .form-input:focus {
            outline: none;
            border-color: #3b82f6;
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

        .btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
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

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .summary-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }

        .summary-number {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .summary-label {
            color: #94a3b8;
            font-size: 0.875rem;
        }

        .summary-number.threats { color: #ef4444; }
        .summary-number.warnings { color: #f59e0b; }
        .summary-number.info { color: #3b82f6; }
        .summary-number.total { color: #10b981; }

        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }

        .chart-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
        }

        .chart-header {
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
        }

        .chart-container {
            position: relative;
            height: 300px;
        }

        .timeline-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
        }

        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .timeline-content {
            max-height: 400px;
            overflow-y: auto;
        }

        .timeline-item {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
        }

        .timeline-header-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .threat-name {
            font-weight: 600;
            color: #f1f5f9;
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

        .timeline-details {
            color: #94a3b8;
            font-size: 0.875rem;
        }

        .timeline-timestamp {
            color: #64748b;
            font-size: 0.75rem;
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

        @media (max-width: 768px) {
            .controls-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
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
            <h1><i class="fas fa-chart-bar"></i> Reports Dashboard</h1>
            <div class="nav-links">
                <a href="index.php"><i class="fas fa-home"></i> Dashboard</a>
                <a href="scanner.php"><i class="fas fa-search"></i> Scanner</a>
                <a href="database.php"><i class="fas fa-database"></i> Database</a>
                <a href="monitor.php"><i class="fas fa-radar"></i> Monitor</a>
            </div>
        </div>

        <div class="report-controls">
            <div class="controls-grid">
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="date" class="form-input" id="start-date">
                </div>
                <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-input" id="end-date">
                </div>
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-chart-line"></i>
                    Generate Report
                </button>
                <button class="btn btn-success" onclick="exportCSV()">
                    <i class="fas fa-file-csv"></i>
                    Export CSV
                </button>
                <button class="btn btn-warning" onclick="exportJSON()">
                    <i class="fas fa-file-code"></i>
                    Export JSON
                </button>
            </div>
        </div>

        <div id="report-content">
            <div class="loading">
                <div class="spinner"></div>
                <h3>Loading Report Data...</h3>
                <p>Generating comprehensive threat analysis report</p>
            </div>
        </div>
    </div>

    <script>
        let currentReport = null;
        let threatChart = null;
        let trendChart = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Set default dates (last 7 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            
            document.getElementById('end-date').value = endDate.toISOString().split('T')[0];
            document.getElementById('start-date').value = startDate.toISOString().split('T')[0];
            
            // Generate initial report
            generateReport();
        });

        function generateReport() {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            showLoading();
            
            fetch('reports.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=generate_report&start_date=${startDate}&end_date=${endDate}`
            })
            .then(response => response.json())
            .then(data => {
                currentReport = data;
                displayReport(data);
            })
            .catch(error => {
                console.error('Error generating report:', error);
                showError('Failed to generate report');
            });
        }

        function showLoading() {
            document.getElementById('report-content').innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <h3>Generating Report...</h3>
                    <p>Analyzing threat detection data</p>
                </div>
            `;
        }

        function showError(message) {
            document.getElementById('report-content').innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }

        function displayReport(report) {
            const content = document.getElementById('report-content');
            
            let html = `
                <!-- Summary Cards -->
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-number total">${report.summary.total_events}</div>
                        <div class="summary-label">Total Events</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number threats">${report.summary.threat_events}</div>
                        <div class="summary-label">Threat Events</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number warnings">${report.summary.warning_events}</div>
                        <div class="summary-label">Warning Events</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number info">${report.summary.info_events}</div>
                        <div class="summary-label">Info Events</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number total">${report.summary.unique_threats.length}</div>
                        <div class="summary-label">Unique Threats</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-number threats">${report.summary.most_detected_threat ? report.summary.most_detected_threat.count : 0}</div>
                        <div class="summary-label">Most Detected</div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <div class="chart-title">Threats by Type</div>
                        </div>
                        <div class="chart-container">
                            <canvas id="threats-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-header">
                            <div class="chart-title">7-Day Threat Trend</div>
                        </div>
                        <div class="chart-container">
                            <canvas id="trend-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="timeline-card">
                    <div class="timeline-header">
                        <div class="chart-title">Threat Detection Timeline</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">
                            Period: ${report.period.start} to ${report.period.end}
                        </div>
                    </div>
                    <div class="timeline-content" id="timeline-content">
                        ${generateTimelineHTML(report.threat_timeline)}
                    </div>
                </div>
            `;
            
            content.innerHTML = html;
            
            // Create charts
            createThreatsChart(report.threats_by_type);
            createTrendChart(report.summary.threat_trend);
        }

        function generateTimelineHTML(timeline) {
            if (timeline.length === 0) {
                return `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-shield-alt" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p>No threats detected in this period</p>
                    </div>
                `;
            }

            let html = '';
            timeline.forEach(item => {
                const levelClass = item.threat_level.toLowerCase();
                html += `
                    <div class="timeline-item">
                        <div class="timeline-header-item">
                            <span class="threat-name">${item.threat}</span>
                            <span class="threat-level threat-${levelClass}">${item.threat_level}</span>
                        </div>
                        <div class="timeline-details">
                            <strong>File:</strong> ${item.detected_file}<br>
                            <strong>Process PID:</strong> ${item.process_pid}
                        </div>
                        <div class="timeline-timestamp">${item.timestamp}</div>
                    </div>
                `;
            });

            return html;
        }

        function createThreatsChart(threatsData) {
            const ctx = document.getElementById('threats-chart').getContext('2d');
            
            if (threatChart) {
                threatChart.destroy();
            }

            const labels = Object.keys(threatsData);
            const data = Object.values(threatsData);
            const colors = [
                '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
                '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'
            ];

            threatChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#1e293b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#e2e8f0',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        function createTrendChart(trendData) {
            const ctx = document.getElementById('trend-chart').getContext('2d');
            
            if (trendChart) {
                trendChart.destroy();
            }

            const labels = Object.keys(trendData);
            const data = Object.values(trendData);

            trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Threats Detected',
                        data: data,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e2e8f0'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                color: 'rgba(148, 163, 184, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#94a3b8'
                            },
                            grid: {
                                color: 'rgba(148, 163, 184, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        function exportCSV() {
            if (!currentReport) {
                alert('Please generate a report first');
                return;
            }

            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'reports.php';
            
            const actionInput = document.createElement('input');
            actionInput.type = 'hidden';
            actionInput.name = 'action';
            actionInput.value = 'export_csv';
            form.appendChild(actionInput);
            
            const startInput = document.createElement('input');
            startInput.type = 'hidden';
            startInput.name = 'start_date';
            startInput.value = startDate;
            form.appendChild(startInput);
            
            const endInput = document.createElement('input');
            endInput.type = 'hidden';
            endInput.name = 'end_date';
            endInput.value = endDate;
            form.appendChild(endInput);
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        }

        function exportJSON() {
            if (!currentReport) {
                alert('Please generate a report first');
                return;
            }

            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'reports.php';
            
            const actionInput = document.createElement('input');
            actionInput.type = 'hidden';
            actionInput.name = 'action';
            actionInput.value = 'export_json';
            form.appendChild(actionInput);
            
            const startInput = document.createElement('input');
            startInput.type = 'hidden';
            startInput.name = 'start_date';
            startInput.value = startDate;
            form.appendChild(startInput);
            
            const endInput = document.createElement('input');
            endInput.type = 'hidden';
            endInput.name = 'end_date';
            endInput.value = endDate;
            form.appendChild(endInput);
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        }
    </script>
</body>
</html>
