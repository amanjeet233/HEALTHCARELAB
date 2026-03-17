$controllers = Get-ChildItem "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking\controller\*.java"

foreach($file in $controllers) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -notmatch "import com.healthcare.labtestbooking.dto.ApiResponse;") {
        $content = $content -replace "import org.springframework.http.ResponseEntity;", "import org.springframework.http.ResponseEntity;`nimport com.healthcare.labtestbooking.dto.ApiResponse;"
    }

    # Add ApiResponse to ResponseEntity generic type
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "ResponseEntity<((?!ApiResponse)[A-Za-z0-9_<>]+)>", "ResponseEntity<ApiResponse<`$1>>")
    
    # Replace ResponseEntity.ok(something) with ApiResponse.success
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, 'ResponseEntity\.ok\((?!ApiResponse)([^)]+)\)', 'ResponseEntity.ok(ApiResponse.success("Success", $1))')
    
    # Handle new ResponseEntity<>(..., HttpStatus.CREATED)
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, 'new ResponseEntity<>\((?!ApiResponse)([^,]+),\s*(HttpStatus\.[A-Z_]+)\)', 'new ResponseEntity<>(ApiResponse.success("Created", $1), $2)')

    Set-Content -Path $file.FullName -Value $content
}
