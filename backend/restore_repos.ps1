$missingRepos = @("TestCategoryRepository", "TestParameterRepository", "TestPackageRepository", "ReportVerificationRepository", "QuizResultRepository", "ReportResultRepository", "ReferenceRangeRepository", "OrderRepository", "GatewayPaymentRepository")

$repoDir = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\repository"

foreach ($r in $missingRepos) {
    $f = Join-Path $repoDir "${r}.java"
    $e = $r -replace "Repository",""
    $content = @"
package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.$e;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface $r extends JpaRepository<$e, Long> {
}
"@
    Set-Content -Path $f -Value $content
}
