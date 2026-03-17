import re

content = open('D:/CU/SEM 6/EPAM/PROJECT/generate_audit.py', 'r', encoding='utf-8').read()

section8 = """report.append("## 8. Architecture Problems & Unused Code\\n")
report.append("### Unused Entities\\n")
for e, d in entities.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {e}")

report.append("\\n### Controllers Without Services\\n")
# find controllers that don't have autowired service
for c, d in controllers.items():
    if not re.search(r'(?:@Autowired|private final \\w+Service|public ' + c + r'\\([^)]*Service)', d['content']):
        report.append(f"- {c}")

report.append("\\n### Services Without Repositories\\n")
# Check if service doesn't have a repository 
for s, st in services.items():
    found = False
    for e, ed in entities.items():
        if ed['service'] == s and ed['repo']:
            found = True
            break
    if not found:
        report.append(f"- {s}")

report.append("\\n### Repositories Without Entities\\n")
for r, e in repositories.items():
    if e not in entities:
        report.append(f"- {r} (Refers to {e})")

report.append("\\n### APIs Not Used By Frontend\\n")
for be in backend_endpoints:
    if not be['called_by_fe']:
        report.append(f"- {be['method']} {be['path']} ({be['controller']})")

report.append("\\n### Frontend Components Not Used\\n")
for c, d in components.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {c}")

report.append("\\n### Database Tables Never Referenced\\n")
for t, d in tables.items():
    if d['status'] == 'UNUSED':
        report.append(f"- {t}")

report.append("")
"""

content = re.sub(r'report\.append\("## 8\. Unused Code\\n"\)(.*?)(?=report\.append\("## 9\. Missing Components\\n"\))', section8, content, flags=re.DOTALL)

open('D:/CU/SEM 6/EPAM/PROJECT/generate_audit.py', 'w', encoding='utf-8').write(content)
