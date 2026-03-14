import os
import re

dto_dir = 'src/main/java/com/healthcare/labtestbooking/dto'

for filename in os.listdir(dto_dir):
    if not filename.endswith('Request.java'):
        continue
    
    filepath = os.path.join(dto_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Simple heuristic to add annotations to private String fields
    content = re.sub(r'(\s+)private String ([a-zA-Z0-9]+);', r'\1@NotBlank(message = "\2 is required")\1@Size(max = 250, message = "\2 must be at most 250 characters")\1private String \2;', content)
    
    # Prevent double annotations
    content = re.sub(r'@NotBlank.*?@NotBlank', r'@NotBlank', content, flags=re.DOTALL)

    import_jakarta = 'import jakarta.validation.constraints.*;'
    if import_jakarta not in content:
        content = re.sub(r'import ', import_jakarta + '\nimport ', content, count=1)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed DTOs")
