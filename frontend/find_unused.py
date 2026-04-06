import os

src_dir = 'src'
all_files = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            all_files.append(os.path.join(root, file))

contents = {}
for f in all_files:
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            contents[f] = fp.read()
    except Exception as e:
        pass

unused_components = []
components_dir = os.path.join('src', 'components')
for root, dirs, files in os.walk(components_dir):
    for file in files:
        if not file.endswith('.tsx') and not file.endswith('.ts'):
            continue
        if file == 'index.ts' or file == 'index.tsx':
            continue
            
        filepath = os.path.join(root, file)
        basename = os.path.splitext(file)[0]
        
        used = False
        for f, content in contents.items():
            if f == filepath:
                continue
            if basename in content:
                used = True
                break
        
        if not used:
            unused_components.append(filepath)

print("Potential Unused:")
for uc in unused_components:
    print(uc)
