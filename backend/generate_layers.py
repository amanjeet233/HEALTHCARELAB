import os
import re

BASE_PATH = r"d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking"

def camel_to_kebab(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1).lower()

def create_file_if_missing(filepath, content):
    if not os.path.exists(filepath):
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created {filepath}")
    else:
        # print(f"Exists {filepath}")
        pass

def main():
    entities_dir = os.path.join(BASE_PATH, "entity")
    repo_dir = os.path.join(BASE_PATH, "repository")
    service_dir = os.path.join(BASE_PATH, "service")
    controller_dir = os.path.join(BASE_PATH, "controller")
    dto_dir = os.path.join(BASE_PATH, "dto")
    
    os.makedirs(repo_dir, exist_ok=True)
    os.makedirs(service_dir, exist_ok=True)
    os.makedirs(controller_dir, exist_ok=True)
    os.makedirs(dto_dir, exist_ok=True)
    
    entities = [f[:-5] for f in os.listdir(entities_dir) if f.endswith('.java')]
    
    for entity in entities:
        # Check components
        repo_file = os.path.join(repo_dir, f"{entity}Repository.java")
        service_file = os.path.join(service_dir, f"{entity}Service.java")
        controller_file = os.path.join(controller_dir, f"{entity}Controller.java")
        dto_request_file = os.path.join(dto_dir, f"{entity}Request.java")
        dto_response_file = os.path.join(dto_dir, f"{entity}Response.java")

        # Basic PK assumption: Long
        pk_type = "Long"

        endpoint_path = camel_to_kebab(entity)

        # 1. DTO Request
        req_content = f"""package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class {entity}Request {{
    // Add validation annotations and fields here
}}
"""
        # 2. DTO Response
        res_content = f"""package com.healthcare.labtestbooking.dto;

import lombok.Data;

@Data
public class {entity}Response {{
    private {pk_type} id;
    // Add other fields here
}}
"""

        # 3. Repository
        repo_content = f"""package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.{entity};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface {entity}Repository extends JpaRepository<{entity}, {pk_type}> {{
}}
"""

        # 4. Service
        service_content = f"""package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.{entity};
import com.healthcare.labtestbooking.repository.{entity}Repository;
import com.healthcare.labtestbooking.dto.{entity}Request;
import com.healthcare.labtestbooking.dto.{entity}Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class {entity}Service {{

    private final {entity}Repository repository;

    @Transactional(readOnly = true)
    public List<{entity}Response> getAll() {{
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }}

    @Transactional(readOnly = true)
    public {entity}Response getById({pk_type} id) {{
        {entity} entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("{entity} not found with id " + id));
        return mapToResponse(entity);
    }}

    @Transactional
    public {entity}Response create({entity}Request request) {{
        {entity} entity = new {entity}();
        // map request to entity here
        {entity} saved = repository.save(entity);
        return mapToResponse(saved);
    }}

    @Transactional
    public {entity}Response update({pk_type} id, {entity}Request request) {{
        {entity} entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("{entity} not found with id " + id));
        // update entity from request here
        {entity} updated = repository.save(entity);
        return mapToResponse(updated);
    }}

    @Transactional
    public void delete({pk_type} id) {{
        repository.deleteById(id);
    }}

    private {entity}Response mapToResponse({entity} entity) {{
        {entity}Response response = new {entity}Response();
        // Assume Long id field for boilerplate
        try {{
            response.setId(entity.getId());
        }} catch(Exception e) {{
            // Ignore if no getId() exists
        }}
        return response;
    }}
}}
"""

        # 5. Controller
        controller_content = f"""package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.{entity}Request;
import com.healthcare.labtestbooking.dto.{entity}Response;
import com.healthcare.labtestbooking.service.{entity}Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/{endpoint_path}s")
@RequiredArgsConstructor
public class {entity}Controller {{

    private final {entity}Service service;

    @GetMapping
    public ResponseEntity<List<{entity}Response>> getAll() {{
        return ResponseEntity.ok(service.getAll());
    }}

    @GetMapping("/{{id}}")
    public ResponseEntity<{entity}Response> getById(@PathVariable {pk_type} id) {{
        return ResponseEntity.ok(service.getById(id));
    }}

    @PostMapping
    public ResponseEntity<{entity}Response> create(@Valid @RequestBody {entity}Request request) {{
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }}

    @PutMapping("/{{id}}")
    public ResponseEntity<{entity}Response> update(@PathVariable {pk_type} id, @Valid @RequestBody {entity}Request request) {{
        return ResponseEntity.ok(service.update(id, request));
    }}

    @DeleteMapping("/{{id}}")
    public ResponseEntity<Void> delete(@PathVariable {pk_type} id) {{
        service.delete(id);
        return ResponseEntity.noContent().build();
    }}
}}
"""

        # Create missing mappings
        create_file_if_missing(dto_request_file, req_content)
        create_file_if_missing(dto_response_file, res_content)
        create_file_if_missing(repo_file, repo_content)
        create_file_if_missing(service_file, service_content)
        create_file_if_missing(controller_file, controller_content)

if __name__ == "__main__":
    main()
