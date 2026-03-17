$content = Get-Content "frontend/src/services/labTest.ts" -Raw
$content = $content -replace "response.data && response.data.content", "response.data?.data?.content"
$content = $content -replace "const pageData = response.data as LabTestPageResponse;", "const pageData = response.data.data as LabTestPageResponse;"
$content = $content -replace "Array.isArray\(response.data\)", "(Array.isArray(response.data?.data) || Array.isArray(response.data))"
$content = $content -replace "return \{ tests: response.data, totalPages: 1 \};", "return { tests: Array.isArray(response.data?.data) ? response.data.data : response.data, totalPages: 1 };"
$content = $content -replace "return response.data as LabTestResponse;", "return (response.data?.data || response.data) as LabTestResponse;"
Set-Content -Path "frontend/src/services/labTest.ts" -Value $content
