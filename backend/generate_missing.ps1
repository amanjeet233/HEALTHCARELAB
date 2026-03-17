$entitiesDir = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\entity"
$repoDir = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\repository"
$serviceDir = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\service"
$controllerDir = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\controller"

Get-ChildItem -Path $entitiesDir -Filter *.java | ForEach-Object {
    $entityName = $_.BaseName

    $repoFile = Join-Path $repoDir "${entityName}Repository.java"
    if (-Not (Test-Path $repoFile)) {
        $repoContent = @"
package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.$entityName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${entityName}Repository extends JpaRepository<$entityName, Long> {
}
"@
        Set-Content -Path $repoFile -Value $repoContent
        Write-Host "Created ${entityName}Repository"
    }

    $serviceFile = Join-Path $serviceDir "${entityName}Service.java"
    if (-Not (Test-Path $serviceFile)) {
        $variableName = $entityName.Substring(0,1).ToLower() + $entityName.Substring(1)
        $serviceContent = @"
package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.$entityName;
import com.healthcare.labtestbooking.repository.${entityName}Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ${entityName}Service {
    private final ${entityName}Repository $variableNameRepository;

    @Transactional(readOnly = true)
    public List<$entityName> getAll() {
        return $variableNameRepository.findAll();
    }
}
"@
        Set-Content -Path $serviceFile -Value $serviceContent
        Write-Host "Created ${entityName}Service"
    }

    $controllerFile = Join-Path $controllerDir "${entityName}Controller.java"
    if (-Not (Test-Path $controllerFile)) {
        $variableName = $entityName.Substring(0,1).ToLower() + $entityName.Substring(1)
        $route = "/api/" + $entityName.ToLower() + "s"
        $controllerContent = @"
package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.entity.$entityName;
import com.healthcare.labtestbooking.service.${entityName}Service;
import com.healthcare.labtestbooking.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("$route")
@RequiredArgsConstructor
public class ${entityName}Controller {
    
    private final ${entityName}Service $variableNameService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<$entityName>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", $variableNameService.getAll()));
    }
}
"@
        Set-Content -Path $controllerFile -Value $controllerContent
        Write-Host "Created ${entityName}Controller"
    }
}
