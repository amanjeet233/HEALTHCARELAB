cd "d:\CU\SEM 6\EPAM\PROJECT\backend\src\main\java\com\healthcare\labtestbooking"
$entities = Get-ChildItem -Path "entity\*.java" | ForEach-Object { $_.BaseName }
foreach ($e in $entities) {
    $r = Test-Path "repository\$eRepository.java"
    $s = Test-Path "service\Service.java"
    $c = Test-Path "controller\Controller.java"
    if (-not $r -or -not $s -or -not $c) {
        Write-Host "$e - Repo:$r, Service:$s, Controller:$c"
    }
}
