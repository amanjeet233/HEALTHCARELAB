import os
import re

controllers_dir = 'src/main/java/com/healthcare/labtestbooking/controller'
dto_dir = 'src/main/java/com/healthcare/labtestbooking/dto'

for filename in os.listdir(controllers_dir):
    if not filename.endswith('Controller.java'):
        continue
    if filename == 'AuthController.java':
        continue
        
    filepath = os.path.join(controllers_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add @Valid before @RequestBody where missing
    content = re.sub(r'(@RequestBody\s+[A-Za-z0-9_<>]+)', r'@Valid \1', content)
    content = re.sub(r'@Valid\s+@Valid', r'@Valid', content)

    # ensure jakarta.validation.Valid is imported if @Valid was just added
    if '@Valid ' in content and 'import jakarta.validation.Valid;' not in content:
        content = re.sub(r'import ', 'import jakarta.validation.Valid;\nimport ', content, count=1)

    # Add @PreAuthorize if the class lacks it and endpoints lack it
    if 'PreAuthorize' not in content:
        # Let's add @PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')") 
        # at the class level
        if '@RestController' in content:
            content = re.sub(r'@RestController', '@RestController\n@PreAuthorize("hasAnyRole(\'PATIENT\', \'TECHNICIAN\', \'MEDICAL_OFFICER\', \'ADMIN\')")', content)
            if 'import org.springframework.security.access.prepost.PreAuthorize;' not in content:
                content = re.sub(r'import ', 'import org.springframework.security.access.prepost.PreAuthorize;\nimport ', content, count=1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed controllers.")
