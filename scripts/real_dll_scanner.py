import psutil
import os
import hashlib
import json
from datetime import datetime
import win32process
import win32api
import win32con

class MinecraftHackDetector:
    def __init__(self):
        # Known hack client signatures
        self.hack_signatures = {
            'horion.dll': {
                'name': 'Horion',
                'risk': 'dangerous',
                'description': 'Popular Minecraft Bedrock hack client'
            },
            'nitr0.exe': {
                'name': 'Nitr0',
                'risk': 'dangerous', 
                'description': 'Minecraft hack client executable'
            },
            'wurst.dll': {
                'name': 'Wurst',
                'risk': 'dangerous',
                'description': 'Wurst Minecraft hack client'
            },
            'impact.dll': {
                'name': 'Impact',
                'risk': 'dangerous',
                'description': 'Impact Minecraft hack client'
            },
            'aristois.dll': {
                'name': 'Aristois',
                'risk': 'suspicious',
                'description': 'Aristois utility mod'
            },
            'meteor.dll': {
                'name': 'Meteor',
                'risk': 'dangerous',
                'description': 'Meteor Minecraft hack client'
            },
            'liquidbounce.dll': {
                'name': 'LiquidBounce',
                'risk': 'dangerous',
                'description': 'LiquidBounce hack client'
            },
            'sigma.dll': {
                'name': 'Sigma',
                'risk': 'dangerous',
                'description': 'Sigma Minecraft hack client'
            }
        }
        
        # Suspicious file patterns
        self.suspicious_patterns = [
            'inject', 'hook', 'bypass', 'cheat', 'hack', 
            'exploit', 'mod_menu', 'overlay', 'trainer'
        ]
        
        # Minecraft process names
        self.minecraft_processes = [
            'Minecraft.Windows.exe',  # Minecraft Windows 10 Edition
            'javaw.exe',              # Java Edition
            'java.exe',               # Java Edition alternative
            'MinecraftLauncher.exe'   # Launcher
        ]

    def find_minecraft_processes(self):
        """Find all running Minecraft processes"""
        minecraft_procs = []
        
        for proc in psutil.process_iter(['pid', 'name', 'exe']):
            try:
                if proc.info['name'] in self.minecraft_processes:
                    minecraft_procs.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'exe': proc.info['exe']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
        return minecraft_procs

    def get_process_modules(self, pid):
        """Get all loaded modules (DLLs) for a process"""
        modules = []
        
        try:
            process = psutil.Process(pid)
            
            # Get memory maps which include loaded DLLs
            for mmap in process.memory_maps():
                if mmap.path and mmap.path.lower().endswith('.dll'):
                    modules.append(mmap.path)
                    
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
            
        return modules

    def analyze_file(self, file_path):
        """Analyze a file for hack client signatures"""
        if not os.path.exists(file_path):
            return None
            
        file_name = os.path.basename(file_path).lower()
        
        # Check against known hack clients
        if file_name in self.hack_signatures:
            return {
                'file': file_path,
                'name': file_name,
                'risk': self.hack_signatures[file_name]['risk'],
                'description': self.hack_signatures[file_name]['description'],
                'detection_type': 'known_signature'
            }
        
        # Check for suspicious patterns
        for pattern in self.suspicious_patterns:
            if pattern in file_name:
                return {
                    'file': file_path,
                    'name': file_name,
                    'risk': 'suspicious',
                    'description': f'Contains suspicious pattern: {pattern}',
                    'detection_type': 'pattern_match'
                }
        
        return None

    def scan_minecraft_process(self, pid):
        """Scan a specific Minecraft process for hack clients"""
        results = {
            'pid': pid,
            'scan_time': datetime.now().isoformat(),
            'threats_found': [],
            'total_modules': 0,
            'suspicious_modules': 0
        }
        
        modules = self.get_process_modules(pid)
        results['total_modules'] = len(modules)
        
        for module_path in modules:
            analysis = self.analyze_file(module_path)
            if analysis:
                results['threats_found'].append(analysis)
                if analysis['risk'] in ['suspicious', 'dangerous']:
                    results['suspicious_modules'] += 1
        
        return results

    def full_system_scan(self):
        """Perform a full scan of all Minecraft processes"""
        minecraft_procs = self.find_minecraft_processes()
        
        if not minecraft_procs:
            return {
                'status': 'no_minecraft_found',
                'message': 'No Minecraft processes detected',
                'scan_time': datetime.now().isoformat()
            }
        
        scan_results = {
            'status': 'completed',
            'scan_time': datetime.now().isoformat(),
            'processes_scanned': len(minecraft_procs),
            'results': []
        }
        
        for proc in minecraft_procs:
            result = self.scan_minecraft_process(proc['pid'])
            result['process_name'] = proc['name']
            result['process_exe'] = proc['exe']
            scan_results['results'].append(result)
        
        return scan_results

    def generate_report(self, scan_results):
        """Generate a detailed report of scan results"""
        if scan_results['status'] == 'no_minecraft_found':
            return scan_results['message']
        
        report = []
        report.append("=== MINECRAFT HACK CLIENT DETECTION REPORT ===")
        report.append(f"Scan Time: {scan_results['scan_time']}")
        report.append(f"Processes Scanned: {scan_results['processes_scanned']}")
        report.append("")
        
        total_threats = 0
        for result in scan_results['results']:
            total_threats += len(result['threats_found'])
            
            report.append(f"Process: {result['process_name']} (PID: {result['pid']})")
            report.append(f"Total Modules: {result['total_modules']}")
            report.append(f"Threats Found: {len(result['threats_found'])}")
            
            if result['threats_found']:
                report.append("DETECTED THREATS:")
                for threat in result['threats_found']:
                    report.append(f"  - {threat['name']} ({threat['risk'].upper()})")
                    report.append(f"    Path: {threat['file']}")
                    report.append(f"    Description: {threat['description']}")
                    report.append("")
            else:
                report.append("No threats detected in this process.")
            
            report.append("-" * 50)
        
        report.append(f"TOTAL THREATS DETECTED: {total_threats}")
        
        return "\n".join(report)

# Main execution
if __name__ == "__main__":
    detector = MinecraftHackDetector()
    
    print("Starting Minecraft Hack Client Detection...")
    print("Scanning for Minecraft processes...")
    
    results = detector.full_system_scan()
    report = detector.generate_report(results)
    
    print(report)
    
    # Save results to file
    with open('minecraft_scan_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDetailed results saved to: minecraft_scan_results.json")
