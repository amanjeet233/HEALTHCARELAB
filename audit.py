import os
import re

backend_src_dir = 'src/main/java'
frontend_src_dir = 'frontend/src'
db_dir = 'database/migrations'
schema_file = 'schema.sql'

def get_java_files(directory):
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith('.java'):
                files.append(os.path.join(root, filename))
    return files

java_files = get_java_files(backend_src_dir)

# Step 1: Detect Unused Entities
entities = {}
repositories = {}
services = {}
controllers = {}

for f in java_files:
    content = open(f, 'r', encoding='utf-8').read()
    class_name_match = re.search(r'class\s+(\w+)', content)
    if not class_name_match:
        continue
    class_name = class_name_match.group(1)
    
    if '@Entity' in content:
        entities[class_name] = f
    if '@Repository' in content or 'extends JpaRepository' in content:
        # try to find the entity entity
        # e.g. JpaRepository<Entity, Id>
        match = re.search(r'JpaRepository<([^,]+)', content)
        if match:
            repositories[match.group(1).strip()] = class_name
        else:
            repositories[class_name] = class_name
    if '@Service' in content:
        services[class_name] = class_name
    if '@RestController' in content or '@Controller' in content:
        controllers[class_name] = content

# Write AUDIT report
with open('ARCHITECTURE-AUDIT.md', 'w') as f:
    f.write('# Architecture Audit Report\n\n')
    f.write('This is a generated report.\n')
