<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

// Database file path
$dbFile = 'data/hack_clients.json';

// Ensure data directory exists
if (!file_exists('data')) {
    mkdir('data', 0755, true);
}

// Initialize database if it doesn't exist
if (!file_exists($dbFile)) {
    $initialData = [
        'last_updated' => date('Y-m-d H:i:s'),
        'version' => '1.0',
        'total_signatures' => 0,
        'hack_clients' => []
    ];
    file_put_contents($dbFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

// Load hack clients database
function loadHackDatabase() {
    global $dbFile;
    $data = json_decode(file_get_contents($dbFile), true);
    return $data ?: ['hack_clients' => []];
}

// Save hack clients database
function saveHackDatabase($data) {
    global $dbFile;
    $data['last_updated'] = date('Y-m-d H:i:s');
    $data['total_signatures'] = count($data['hack_clients']);
    return file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
}

// Default hack clients data
function getDefaultHackClients() {
    return [
        [
            'id' => 'horion_dll',
            'name' => 'horion.dll',
            'type' => 'DLL',
            'threat_level' => 'HIGH',
            'category' => 'Injection Client',
            'description' => 'Horion is a popular Minecraft Bedrock Edition hack client that provides various cheats and modifications.',
            'detection_methods' => ['File Name', 'Process Injection', 'Memory Signature'],
            'file_signatures' => ['horion.dll', 'horion_client.dll'],
            'memory_patterns' => ['48 89 5C 24 ? 57 48 83 EC 20 48 8B DA 48 8B F9'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\Horion'],
            'network_indicators' => ['horion-client.com', 'api.horion.download'],
            'first_seen' => '2019-03-15',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 9.5,
            'active' => true
        ],
        [
            'id' => 'nitr0_exe',
            'name' => 'nitr0.exe',
            'type' => 'EXE',
            'threat_level' => 'HIGH',
            'category' => 'Launcher/Injector',
            'description' => 'Nitr0 is a Minecraft hack client launcher and injector that loads various cheat modules.',
            'detection_methods' => ['File Name', 'Process Analysis', 'Behavioral Detection'],
            'file_signatures' => ['nitr0.exe', 'nitr0_launcher.exe', 'nitr0.dll'],
            'memory_patterns' => ['4C 8B DC 49 89 5B 08 49 89 6B 10 49 89 73 18'],
            'registry_keys' => ['HKEY_LOCAL_MACHINE\\Software\\Nitr0'],
            'network_indicators' => ['nitr0.cc', 'download.nitr0.cc'],
            'first_seen' => '2020-01-10',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 9.2,
            'active' => true
        ],
        [
            'id' => 'wurst_client',
            'name' => 'wurst.dll',
            'type' => 'DLL',
            'threat_level' => 'HIGH',
            'category' => 'Mod Client',
            'description' => 'Wurst is one of the most popular Minecraft hack clients with extensive features.',
            'detection_methods' => ['File Name', 'Mod Detection', 'Network Analysis'],
            'file_signatures' => ['wurst.dll', 'wurst_client.dll', 'wurst.jar'],
            'memory_patterns' => ['48 8B C4 48 89 58 08 48 89 68 10 48 89 70 18'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\Wurst'],
            'network_indicators' => ['wurstclient.net', 'api.wurstclient.net'],
            'first_seen' => '2014-08-20',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 8.8,
            'active' => true
        ],
        [
            'id' => 'liquidbounce',
            'name' => 'liquidbounce.dll',
            'type' => 'DLL',
            'threat_level' => 'HIGH',
            'category' => 'Injection Client',
            'description' => 'LiquidBounce is a free and open-source Minecraft hack client.',
            'detection_methods' => ['File Name', 'Process Injection', 'API Hooking'],
            'file_signatures' => ['liquidbounce.dll', 'liquidbounce.jar'],
            'memory_patterns' => ['48 89 5C 24 ? 48 89 74 24 ? 57 48 83 EC 20'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\LiquidBounce'],
            'network_indicators' => ['liquidbounce.net', 'api.liquidbounce.net'],
            'first_seen' => '2015-06-12',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 8.5,
            'active' => true
        ],
        [
            'id' => 'impact_client',
            'name' => 'impact.dll',
            'type' => 'DLL',
            'threat_level' => 'HIGH',
            'category' => 'Utility Client',
            'description' => 'Impact is a Minecraft utility mod and hack client.',
            'detection_methods' => ['File Name', 'Mod Detection', 'Memory Scanning'],
            'file_signatures' => ['impact.dll', 'impact.jar', 'impact_client.dll'],
            'memory_patterns' => ['4C 8B DC 49 89 5B 08 49 89 73 10 57 48 81 EC'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\Impact'],
            'network_indicators' => ['impactclient.net', 'api.impactclient.net'],
            'first_seen' => '2017-02-28',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 8.3,
            'active' => true
        ],
        [
            'id' => 'sigma_client',
            'name' => 'sigma.dll',
            'type' => 'DLL',
            'threat_level' => 'HIGH',
            'category' => 'Premium Client',
            'description' => 'Sigma is a premium Minecraft hack client with advanced features.',
            'detection_methods' => ['File Name', 'License Verification', 'Behavioral Analysis'],
            'file_signatures' => ['sigma.dll', 'sigma_client.dll', 'sigma5.dll'],
            'memory_patterns' => ['48 8B C4 48 89 58 08 48 89 70 10 48 89 78 18'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\Sigma'],
            'network_indicators' => ['sigmaclient.info', 'api.sigmaclient.info'],
            'first_seen' => '2018-11-05',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 9.0,
            'active' => true
        ],
        [
            'id' => 'cheat_engine',
            'name' => 'cheatengine.exe',
            'type' => 'EXE',
            'threat_level' => 'MEDIUM',
            'category' => 'Memory Editor',
            'description' => 'Cheat Engine is a memory scanner and editor that can be used to modify game values.',
            'detection_methods' => ['Process Name', 'Window Title', 'Memory Access'],
            'file_signatures' => ['cheatengine.exe', 'cheat engine.exe', 'ce.exe'],
            'memory_patterns' => ['48 89 5C 24 ? 48 89 6C 24 ? 48 89 74 24 ? 57'],
            'registry_keys' => ['HKEY_CURRENT_USER\\Software\\Cheat Engine'],
            'network_indicators' => ['cheatengine.org'],
            'first_seen' => '2000-01-01',
            'last_updated' => date('Y-m-d'),
            'severity_score' => 7.0,
            'active' => true
        ]
    ];
}

// Initialize database with default data if empty
$db = loadHackDatabase();
if (empty($db['hack_clients'])) {
    $db['hack_clients'] = getDefaultHackClients();
    saveHackDatabase($db);
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'get_database':
            $db = loadHackDatabase();
            echo json_encode($db);
            exit;
            
        case 'add_client':
            $db = loadHackDatabase();
            $newClient = [
                'id' => uniqid(),
                'name' => $_POST['name'],
                'type' => $_POST['type'],
                'threat_level' => $_POST['threat_level'],
                'category' => $_POST['category'],
                'description' => $_POST['description'],
                'detection_methods' => explode(',', $_POST['detection_methods']),
                'file_signatures' => explode(',', $_POST['file_signatures']),
                'first_seen' => date('Y-m-d'),
                'last_updated' => date('Y-m-d'),
                'severity_score' => floatval($_POST['severity_score']),
                'active' => true
            ];
            $db['hack_clients'][] = $newClient;
            saveHackDatabase($db);
            echo json_encode(['success' => true, 'message' => 'Hack client berhasil ditambahkan']);
            exit;
            
        case 'update_client':
            $db = loadHackDatabase();
            $clientId = $_POST['client_id'];
            foreach ($db['hack_clients'] as &$client) {
                if ($client['id'] === $clientId) {
                    $client['name'] = $_POST['name'];
                    $client['type'] = $_POST['type'];
                    $client['threat_level'] = $_POST['threat_level'];
                    $client['category'] = $_POST['category'];
                    $client['description'] = $_POST['description'];
                    $client['detection_methods'] = explode(',', $_POST['detection_methods']);
                    $client['file_signatures'] = explode(',', $_POST['file_signatures']);
                    $client['severity_score'] = floatval($_POST['severity_score']);
                    $client['last_updated'] = date('Y-m-d');
                    break;
                }
            }
            saveHackDatabase($db);
            echo json_encode(['success' => true, 'message' => 'Hack client berhasil diupdate']);
            exit;
            
        case 'delete_client':
            $db = loadHackDatabase();
            $clientId = $_POST['client_id'];
            $db['hack_clients'] = array_filter($db['hack_clients'], function($client) use ($clientId) {
                return $client['id'] !== $clientId;
            });
            $db['hack_clients'] = array_values($db['hack_clients']);
            saveHackDatabase($db);
            echo json_encode(['success' => true, 'message' => 'Hack client berhasil dihapus']);
            exit;
            
        case 'toggle_client':
            $db = loadHackDatabase();
            $clientId = $_POST['client_id'];
            foreach ($db['hack_clients'] as &$client) {
                if ($client['id'] === $clientId) {
                    $client['active'] = !$client['active'];
                    $client['last_updated'] = date('Y-m-d');
                    break;
                }
            }
            saveHackDatabase($db);
            echo json_encode(['success' => true, 'message' => 'Status hack client berhasil diubah']);
            exit;
    }
}

$pageTitle = "Hack Client Database - Minecraft Hack Detector";
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

        .database-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 4px;
        }

        .stat-label {
            color: #94a3b8;
            font-size: 0.875rem;
        }

        .controls {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
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

        .search-box {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .search-input {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            color: #e2e8f0;
            font-size: 0.875rem;
            width: 250px;
        }

        .search-input:focus {
            outline: none;
            border-color: #3b82f6;
        }

        .clients-table {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            overflow: hidden;
        }

        .table-header {
            background: rgba(30, 41, 59, 0.8);
            padding: 16px 24px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .table-header h2 {
            color: #f1f5f9;
            font-size: 1.25rem;
        }

        .table-content {
            max-height: 600px;
            overflow-y: auto;
        }

        .client-item {
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            padding: 20px 24px;
            transition: all 0.3s ease;
        }

        .client-item:hover {
            background: rgba(30, 41, 59, 0.3);
        }

        .client-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .client-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #f1f5f9;
        }

        .client-badges {
            display: flex;
            gap: 8px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-high {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .badge-medium {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
        }

        .badge-low {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .badge-dll {
            background: rgba(139, 92, 246, 0.2);
            color: #8b5cf6;
        }

        .badge-exe {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }

        .client-info {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 16px;
            margin-bottom: 12px;
        }

        .client-description {
            color: #94a3b8;
            font-size: 0.875rem;
        }

        .client-meta {
            color: #64748b;
            font-size: 0.75rem;
        }

        .client-actions {
            display: flex;
            gap: 8px;
        }

        .btn-small {
            padding: 6px 12px;
            font-size: 0.75rem;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
        }

        .modal-content {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 16px;
            padding: 24px;
            max-width: 600px;
            margin: 50px auto;
            max-height: 80vh;
            overflow-y: auto;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            color: #f1f5f9;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            color: #e2e8f0;
            font-size: 0.875rem;
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
        }

        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
            
            .controls {
                flex-direction: column;
                gap: 16px;
            }
            
            .client-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-database"></i> Hack Client Database</h1>
            <div class="nav-links">
                <a href="index.php"><i class="fas fa-home"></i> Dashboard</a>
                <a href="scanner.php"><i class="fas fa-search"></i> Scanner</a>
                <a href="reports.php"><i class="fas fa-file-alt"></i> Reports</a>
            </div>
        </div>

        <div class="database-stats" id="database-stats">
            <!-- Stats will be loaded here -->
        </div>

        <div class="controls">
            <div class="search-box">
                <input type="text" class="search-input" id="search-input" placeholder="Cari hack client...">
                <button class="btn btn-primary" onclick="searchClients()">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <div>
                <button class="btn btn-success" onclick="showAddModal()">
                    <i class="fas fa-plus"></i>
                    Tambah Client
                </button>
                <button class="btn btn-warning" onclick="exportDatabase()">
                    <i class="fas fa-download"></i>
                    Export
                </button>
            </div>
        </div>

        <div class="clients-table">
            <div class="table-header">
                <h2>Daftar Hack Client</h2>
            </div>
            <div class="table-content" id="clients-list">
                <!-- Clients will be loaded here -->
            </div>
        </div>
    </div>

    <!-- Add/Edit Modal -->
    <div id="client-modal" class="modal">
        <div class="modal-content">
            <h2 id="modal-title">Tambah Hack Client</h2>
            <form id="client-form">
                <input type="hidden" id="client-id">
                
                <div class="form-group">
                    <label class="form-label">Nama File</label>
                    <input type="text" class="form-input" id="client-name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select class="form-select" id="client-type" required>
                        <option value="DLL">DLL</option>
                        <option value="EXE">EXE</option>
                        <option value="JAR">JAR</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Threat Level</label>
                    <select class="form-select" id="client-threat" required>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <input type="text" class="form-input" id="client-category" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Deskripsi</label>
                    <textarea class="form-textarea" id="client-description" required></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Metode Deteksi (pisahkan dengan koma)</label>
                    <input type="text" class="form-input" id="client-methods" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">File Signatures (pisahkan dengan koma)</label>
                    <input type="text" class="form-input" id="client-signatures" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Severity Score (0-10)</label>
                    <input type="number" class="form-input" id="client-score" min="0" max="10" step="0.1" required>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-danger" onclick="closeModal()">Batal</button>
                    <button type="submit" class="btn btn-success">Simpan</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let currentDatabase = null;

        // Load database on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadDatabase();
        });

        function loadDatabase() {
            fetch('database.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_database'
            })
            .then(response => response.json())
            .then(data => {
                currentDatabase = data;
                displayStats(data);
                displayClients(data.hack_clients);
            });
        }

        function displayStats(data) {
            const statsDiv = document.getElementById('database-stats');
            const totalClients = data.hack_clients.length;
            const activeClients = data.hack_clients.filter(c => c.active).length;
            const highThreat = data.hack_clients.filter(c => c.threat_level === 'HIGH').length;
            const dllCount = data.hack_clients.filter(c => c.type === 'DLL').length;

            statsDiv.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${totalClients}</div>
                    <div class="stat-label">Total Signatures</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${activeClients}</div>
                    <div class="stat-label">Active Clients</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${highThreat}</div>
                    <div class="stat-label">High Threat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dllCount}</div>
                    <div class="stat-label">DLL Files</div>
                </div>
            `;
        }

        function displayClients(clients) {
            const clientsList = document.getElementById('clients-list');
            
            if (clients.length === 0) {
                clientsList.innerHTML = '<div style="padding: 40px; text-align: center; color: #94a3b8;">Tidak ada hack client ditemukan</div>';
                return;
            }

            let html = '';
            clients.forEach(client => {
                const threatClass = client.threat_level.toLowerCase();
                const typeClass = client.type.toLowerCase();
                const statusIcon = client.active ? 'fa-check-circle' : 'fa-times-circle';
                const statusColor = client.active ? '#10b981' : '#ef4444';

                html += `
                    <div class="client-item">
                        <div class="client-header">
                            <div class="client-name">
                                <i class="fas ${statusIcon}" style="color: ${statusColor}; margin-right: 8px;"></i>
                                ${client.name}
                            </div>
                            <div class="client-badges">
                                <span class="badge badge-${threatClass}">${client.threat_level}</span>
                                <span class="badge badge-${typeClass}">${client.type}</span>
                            </div>
                        </div>
                        <div class="client-info">
                            <div class="client-description">${client.description}</div>
                            <div class="client-meta">
                                <strong>Category:</strong> ${client.category}<br>
                                <strong>Score:</strong> ${client.severity_score}/10
                            </div>
                            <div class="client-meta">
                                <strong>First Seen:</strong> ${client.first_seen}<br>
                                <strong>Updated:</strong> ${client.last_updated}
                            </div>
                        </div>
                        <div class="client-actions">
                            <button class="btn btn-primary btn-small" onclick="editClient('${client.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-warning btn-small" onclick="toggleClient('${client.id}')">
                                <i class="fas fa-toggle-${client.active ? 'on' : 'off'}"></i> 
                                ${client.active ? 'Disable' : 'Enable'}
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deleteClient('${client.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });

            clientsList.innerHTML = html;
        }

        function searchClients() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            if (!currentDatabase) return;

            const filteredClients = currentDatabase.hack_clients.filter(client => 
                client.name.toLowerCase().includes(searchTerm) ||
                client.description.toLowerCase().includes(searchTerm) ||
                client.category.toLowerCase().includes(searchTerm)
            );

            displayClients(filteredClients);
        }

        function showAddModal() {
            document.getElementById('modal-title').textContent = 'Tambah Hack Client';
            document.getElementById('client-form').reset();
            document.getElementById('client-id').value = '';
            document.getElementById('client-modal').style.display = 'block';
        }

        function editClient(clientId) {
            const client = currentDatabase.hack_clients.find(c => c.id === clientId);
            if (!client) return;

            document.getElementById('modal-title').textContent = 'Edit Hack Client';
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-name').value = client.name;
            document.getElementById('client-type').value = client.type;
            document.getElementById('client-threat').value = client.threat_level;
            document.getElementById('client-category').value = client.category;
            document.getElementById('client-description').value = client.description;
            document.getElementById('client-methods').value = client.detection_methods.join(', ');
            document.getElementById('client-signatures').value = client.file_signatures.join(', ');
            document.getElementById('client-score').value = client.severity_score;
            document.getElementById('client-modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('client-modal').style.display = 'none';
        }

        function toggleClient(clientId) {
            fetch('database.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=toggle_client&client_id=${clientId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadDatabase();
                }
            });
        }

        function deleteClient(clientId) {
            if (!confirm('Apakah Anda yakin ingin menghapus hack client ini?')) return;

            fetch('database.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=delete_client&client_id=${clientId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadDatabase();
                }
            });
        }

        function exportDatabase() {
            if (!currentDatabase) return;
            
            const dataStr = JSON.stringify(currentDatabase, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hack_clients_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }

        // Form submission
        document.getElementById('client-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const clientId = document.getElementById('client-id').value;
            const action = clientId ? 'update_client' : 'add_client';
            
            const formData = new FormData();
            formData.append('action', action);
            if (clientId) formData.append('client_id', clientId);
            formData.append('name', document.getElementById('client-name').value);
            formData.append('type', document.getElementById('client-type').value);
            formData.append('threat_level', document.getElementById('client-threat').value);
            formData.append('category', document.getElementById('client-category').value);
            formData.append('description', document.getElementById('client-description').value);
            formData.append('detection_methods', document.getElementById('client-methods').value);
            formData.append('file_signatures', document.getElementById('client-signatures').value);
            formData.append('severity_score', document.getElementById('client-score').value);

            fetch('database.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeModal();
                    loadDatabase();
                }
            });
        });

        // Search on enter
        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchClients();
            }
        });

        // Close modal on outside click
        document.getElementById('client-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>
