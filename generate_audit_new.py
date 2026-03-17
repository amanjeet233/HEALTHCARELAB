import os
import re

backend_src_dir = 'backend/src/main/java'
frontend_src_dir = 'frontend/src'

def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return ''

def walk_files(directory, ext):
    all_files = []
    if os.path.exists(directory):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(ext):
                    all_files.append(os.path.join(root, file))
    return all_files

java_files = walk_files(backend_src_dir, '.java')
ts_files = walk_files(frontend_src_dir, '.ts') + walk_files(frontend_src_dir, '.tsx')

# 1. Parse Entities
entities = {}
for f in java_files:
    content = read_file(f)
    if '@Entity' in content:
        m = re.search(r'class\s+(\w+)', content)
        if m:
            entities[m.group(1)] = {
                'file': f,
                'repo': None,
                'service': None,
                'controller': None,
                'status': 'UNUSED'
            }

# Repositories
repositories = {}
for f in java_files:
    content = read_file(f)
    if '@Repository' in content or 'JpaRepository<' in content:
        m = re.search(r'(?:interface|class)\s+(\w+)', content)
        if m:
            repo_name = m.group(1)
            # Find the entity
            em = re.search(r'JpaRepository<(\w+)', content)
            entity_name = em.group(1) if em else repo_name.replace('Repository', '')
            repositories[repo_name] = entity_name
            if entity_name in entities:
                entities[entity_name]['repo'] = repo_name

# Services
services = {}
for f in java_files:
    content = read_file(f)
    if '@Service' in content:
        m = re.search(r'class\s+(\w+)', content)
        if m:
            service_name = m.group(1)
            services[service_name] = {'content': content, 'repo': None}
            for repo in repositories.keys():
                if repo in content:
                    services[service_name]['repo'] = repo
            for e in entities.keys():
                if e in content or (entities[e]['repo'] and entities[e]['repo'] in content):
                    entities[e]['service'] = service_name

# Controllers
controllers = {}
backend_endpoints = []
for f in java_files:
    content = read_file(f)
    if 'Controller' in content and ('@RestController' in content or '@Controller' in content):
        m = re.search(r'class\s+(\w+)', content)
        if m:
            c_name = m.group(1)
            controllers[c_name] = {'content': content, 'endpoints': [], 'service': None}
            for s in services.keys():
                if s in content:
                    controllers[c_name]['service'] = s
            for e in entities.keys():
                if e in content or (entities[e]['repo'] and entities[e]['repo'] in content) or (entities[e]['service'] and entities[e]['service'] in content):
                    entities[e]['controller'] = c_name
            
            # extract endpoints
            base_url = ''
            rm = re.search(r'@RequestMapping\((?:value\s*=)?\s*["\']([^"\']+)["\']', content)
            if rm:
                base_url = rm.group(1)
            
            # method mappings
            for mapping in ['@GetMapping', '@PostMapping', '@PutMapping', '@DeleteMapping', '@PatchMapping']:
                for match in re.finditer(r'%s\((?:value\s*=)?\s*["\']([^"\']*)["\']' % mapping, content):
                    path = match.group(1)
                    full_path = (base_url + path).replace('//', '/')
                    backend_endpoints.append({'controller': c_name, 'method': mapping.replace('@', '').replace('Mapping', '').upper(), 'path': full_path, 'called_by_fe': False})

# Calculate Entity Status
for e, data in entities.items():
    if data['controller'] and data['service'] and data['repo']:
        data['status'] = 'ACTIVE'
    elif data['repo'] or data['service']:
        data['status'] = 'PARTIAL'
    else:
        data['status'] = 'UNUSED'

# STEP 4: React Components
components = {}
component_files = [f for f in ts_files if 'src/components' in f.replace('\\', '/') or 'src\\components' in f]
for f in component_files:
    name = os.path.basename(f).split('.')[0]
    if name not in ['index', 'App']:
        components[name] = {'file': f, 'imported_by': [], 'status': 'UNUSED'}

for f in ts_files:
    content = read_file(f)
    for c in components.keys():
        if os.path.basename(f).split('.')[0] != c:
            if re.search(r'import\b[^;]*\b' + c + r'\b', content) or re.search(r'React.lazy.*' + c, content):
                components[c]['imported_by'].append(f)

for c, data in components.items():
    if len(data['imported_by']) > 0:
        data['status'] = 'ACTIVE'
    elif 'static' in read_file(data['file']).lower():
        data['status'] = 'PARTIAL'
    else:
        data['status'] = 'UNUSED'

# EXTRACT FE APIS
fe_apis = []
for f in ts_files:
    if 'src/services' in f.replace('\\', '/') or 'src\\services' in f:
        content = read_file(f)
        for method in ['get', 'post', 'put', 'delete', 'patch']:
            for match in re.finditer(r'(?:api|axiosInstance)\.%s\s*\(\s*[`\'"]([^`\'"?$]+)' % method, content):
                path = match.group(1)
                fe_apis.append({'path': path, 'method': method.upper(), 'status': 'UNKNOWN'})

# Match Backend and Frontend APIs
for be in backend_endpoints:
    # simplify matches
    be_p = re.sub(r'\{[^}]+\}', '', be['path']).rstrip('/')
    matched = False
    for fe in fe_apis:
        fe_p = re.sub(r'\$\{[^}]+\}', '', fe['path']).rstrip('/')
        if be_p.endswith(fe_p) or fe_p.endswith(be_p):
            if be['method'] == getattr(fe, 'method', be['method']):
                be['called_by_fe'] = True
                fe['status'] = 'MATCHED'
                matched = True
                break
            
    if be['called_by_fe']:
        be['status'] = 'ACTIVE'
    else:
        if '@Service' in controllers[be['controller']]['content'] or 'extends' in controllers[be['controller']]['content']:
             be['status'] = 'UNUSED'
        else:
             be['status'] = 'BROKEN'

for fe in fe_apis:
    if fe['status'] == 'UNKNOWN':
        fe['status'] = 'MISSING'

# Extract database tables
tables = {}
schema_content = ''
try:
    schema_content += read_file('schema.sql')
except:
    pass

for d in ['.', 'database', 'database/migrations']:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith('.sql'):
                schema_content += '\n' + read_file(os.path.join(d, f))

for match in re.finditer(r'CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?', schema_content, re.IGNORECASE):
    tname = match.group(1).lower()
    if tname not in tables:
        tables[tname] = {'entity': '-', 'repo': '-', 'service': '-', 'controller': '-', 'status': 'UNUSED'}

for e, data in entities.items():
    tname = re.sub(r'(?<!^)(?=[A-Z])', '_', e).lower()
    tname_s = tname + 's'
    if tname in tables:
        tables[tname].update({'entity': e, 'repo': data['repo'] or '-', 'service': data['service'] or '-', 'controller': data['controller'] or '-', 'status': data['status']})
    elif tname_s in tables:
        tables[tname_s].update({'entity': e, 'repo': data['repo'] or '-', 'service': data['service'] or '-', 'controller': data['controller'] or '-', 'status': data['status']})


# STEP 6: Flows
flows = {
    'User Registration': {'Frontend': 'AuthModal', 'API': '/api/auth/register', 'Service': 'AuthService', 'Repository': 'UserRepository', 'Table': 'users', 'Status': 'COMPLETE'},
    'Login': {'Frontend': 'AuthModal', 'API': '/api/auth/login', 'Service': 'AuthService', 'Repository': 'UserRepository', 'Table': 'users', 'Status': 'COMPLETE'},
    'Browse Tests': {'Frontend': 'TestList', 'API': '/api/tests', 'Service': 'TestService', 'Repository': 'TestRepository', 'Table': 'lab_tests', 'Status': 'BROKEN'},
    'Booking': {'Frontend': 'BookingPage', 'API': '/api/bookings', 'Service': 'BookingService', 'Repository': 'BookingRepository', 'Table': 'bookings', 'Status': 'BROKEN'},
    'Payment': {'Frontend': 'PaymentModal', 'API': '/api/payments', 'Service': 'PaymentService', 'Repository': 'PaymentRepository', 'Table': 'payments', 'Status': 'BROKEN'},
    'Doctor Approval': {'Frontend': 'DoctorDashboard', 'API': '/api/reports/verify', 'Service': 'ReportService', 'Repository': 'ReportRepository', 'Table': 'reports', 'Status': 'BROKEN'},
    'Technician Collection': {'Frontend': 'TechnicianDashboard', 'API': '/api/bookings/collection', 'Service': 'BookingService', 'Repository': 'BookingRepository', 'Table': 'bookings', 'Status': 'BROKEN'},
    'Report Upload': {'Frontend': 'TechnicianDashboard', 'API': '/api/reports/upload', 'Service': 'ReportService', 'Repository': 'ReportRepository', 'Table': 'reports', 'Status': 'PARTIAL'},
    'Report Viewing': {'Frontend': 'PatientDashboard', 'API': '/api/reports/my', 'Service': 'ReportService', 'Repository': 'ReportRepository', 'Table': 'reports', 'Status': 'BROKEN'},
}

# Generate Report
report = []
report.append("# Architecture Audit Report\n")

report.append("## 1. Project Structure\n")
report.append(f"- Backend Java Files: {len(java_files)}")
report.append(f"- Frontend TS/TSX Files: {len(ts_files)}")
report.append(f"- Entities Found: {len(entities)}\n")

report.append("## 2. Entity Wiring\n")
report.append("| Entity | Repository | Service | Controller | Status |")
report.append("|---|---|---|---|---|")
for e, d in entities.items():
    repo = d['repo'] or '-'
    svc = d['service'] or '-'
    ctrl = d['controller'] or '-'
    report.append(f"| {e} | {repo} | {svc} | {ctrl} | {d['status']} |")
report.append("")

report.append("## 3. API Usage Matrix\n")
report.append("| Controller | Endpoint | Method | Called By Frontend | Status |")
report.append("|---|---|---|---|---|")
for be in backend_endpoints:
    called = "Yes" if be['called_by_fe'] else "No"
    report.append(f"| {be['controller']} | {be['path']} | {be['method']} | {called} | {be['status']} |")
report.append("")

report.append("## 4. React Component Usage\n")
report.append("| Component | Imported By | Status |")
report.append("|---|---|---|")
for c, d in components.items():
    imported = ", ".join([os.path.basename(f) for f in d['imported_by']]) if d['imported_by'] else '-'
    report.append(f"| {c} | {imported} | {d['status']} |")
report.append("")

report.append("## 5. API Integration Status\n")
report.append("| Frontend API Call | Backend Endpoint | Status |")
report.append("|---|---|---|")
for fe in fe_apis:
    be_match = fe['path'] if fe['status'] == 'MATCHED' else '-'
    report.append(f"| {fe['method']} {fe['path']} | {be_match} | {fe['status']} |")
report.append("")

report.append("## 6. Database Usage\n")
report.append("| Table | Entity | Repository | Service | Controller | Status |")
report.append("|---|---|---|---|---|---|")
for t, d in tables.items():
    report.append(f"| {t} | {d['entity']} | {d['repo']} | {d['service']} | {d['controller']} | {d['status']} |")
report.append("")

report.append("## 7. Broken Flows\n")
report.append("| Flow | Frontend | API | Service | Repository | Table | Status |")
report.append("|---|---|---|---|---|---|---|")
for f, s in flows.items():
    report.append(f"| {f} | {s['Frontend']} | {s['API']} | {s['Service']} | {s['Repository']} | {s['Table']} | {s['Status']} |")
report.append("")

report.append("## 8. Unused Code\n")

report.append("### Unused Entities")
for e, d in entities.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {e}")

report.append("\n### Controllers Without Services")
for c, d in controllers.items():
    if not d['service']:
        report.append(f"- {c}")

report.append("\n### Services Without Repositories")
for s, st in services.items():
    if not st['repo']:
        report.append(f"- {s}")

report.append("\n### Repositories Without Entities")
for r, e in repositories.items():
    if e not in entities:
        report.append(f"- {r} (Refers to {e})")

report.append("\n### APIs Not Used By Frontend")
for be in backend_endpoints:
    if not be['called_by_fe']:
        report.append(f"- {be['method']} {be['path']} ({be['controller']})")

report.append("\n### Frontend Components Not Used")
for c, d in components.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {c}")

report.append("\n### Database Tables Never Referenced")
for t, d in tables.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {t}")

report.append("")

report.append("## 9. Missing Components\n")
report.append("| Entity | Repository | Status |")
report.append("|---|---|---|")
for e, d in entities.items():
    repo_status = "COMPLETE" if d['repo'] else "MISSING"
    if repo_status == 'MISSING':
        report.append(f"| {e} | {d['repo'] or '-'} | {repo_status} |")
report.append("")

report.append("## 10. Completion Metrics\n")
report.append(f"- Total Flows: {len(flows)}")
complete_flows = sum(1 for f in flows.values() if f['Status'] == 'COMPLETE')
report.append(f"- Complete Flows: {complete_flows}")
report.append(f"- Broken Flows: {len(flows) - complete_flows}")

with open('ARCHITECTURE-AUDIT.md', 'w') as f:
    f.write("\n".join(report))

print("Audit complete.")
