$repos = "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\repository"

# TestParameterRepository
$tp = Join-Path $repos "TestParameterRepository.java"
$content = Get-Content $tp -Raw
$content = $content -replace "}?$", "    java.util.List<com.healthcare.labtestbooking.entity.TestParameter> findByTestOrderByDisplayOrder(com.healthcare.labtestbooking.entity.LabTest test);
}"
Set-Content -Path $tp -Value $content

# TestPackageRepository
$tpack = Join-Path $repos "TestPackageRepository.java"
$content = Get-Content $tpack -Raw
$content = $content -replace "}?$", "    java.util.List<com.healthcare.labtestbooking.entity.TestPackage> findByIsActiveTrue();
}"
Set-Content -Path $tpack -Value $content

# ReportVerificationRepository
$rv = Join-Path $repos "ReportVerificationRepository.java"
$content = Get-Content $rv -Raw
$content = $content -replace "}?$", "    java.util.List<com.healthcare.labtestbooking.entity.ReportVerification> findByStatusOrderByCreatedAtDesc(com.healthcare.labtestbooking.entity.enums.VerificationStatus status);
    java.util.Optional<com.healthcare.labtestbooking.entity.ReportVerification> findByBookingId(Long bookingId);
}"
Set-Content -Path $rv -Value $content

# ReportResultRepository
$rr = Join-Path $repos "ReportResultRepository.java"
$content = Get-Content $rr -Raw
$content = $content -replace "}?$", "    java.util.List<com.healthcare.labtestbooking.entity.ReportResult> findByBookingId(Long bookingId);
}"
Set-Content -Path $rr -Value $content
