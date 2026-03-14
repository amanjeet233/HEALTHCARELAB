import os
import re

sql_files = []
for root, dirs, files in os.walk('.'):
    # skip target directory to avoid duplicates if resources were built
    if 'target' in root:
        continue
    for file in files:
        if file.endswith('.sql'):
            sql_files.append(os.path.join(root, file))

table_names = set()
for sql_file in sql_files:
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = re.finditer(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)', content, re.IGNORECASE)
            for match in matches:
                table_names.add(match.group(1).lower())
    except Exception as e:
        print("Error reading", sql_file, e)

print("Tables found in SQL:\n", sorted(table_names))

entities_dir = r"src\main\java\com\healthcare\labtestbooking\entity"
entity_files = [f for f in os.listdir(entities_dir) if f.endswith('.java')]
entity_names = set()

for ef in entity_files:
    # Read the file and look for @Table(name = "...")
    try:
        with open(os.path.join(entities_dir, ef), 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'@Table\s*\(\s*name\s*=\s*"([^"]+)"\s*\)', content)
            if match:
                entity_names.add(match.group(1).lower())
            else:
                # To snake case based on class name
                name = ef.replace('.java', '')
                s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
                snake_name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
                entity_names.add(snake_name)
    except:
        pass

print("\nEntities (Mapped Tables):\n", sorted(entity_names))

missing_entities = table_names - entity_names
print("\nTables missing Entities:\n", sorted(missing_entities))
