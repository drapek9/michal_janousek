# Lokální vývoj – PHP server (admin + API)
# Použití: .\dev-server.ps1
# Pak otevřete: http://localhost:8080/admin/

$port = 8080
$root = $PSScriptRoot

$phpCandidates = @(
    "php",
    "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe",
    "C:\laragon\bin\php\php-8.2.12-Win32-vs16-x64\php.exe",
    "C:\laragon\bin\php\php-8.1.10-Win32-vs16-x64\php.exe",
    "C:\xampp\php\php.exe"
)

$php = $null
foreach ($candidate in $phpCandidates) {
    if ($candidate -eq "php") {
        $found = Get-Command php -ErrorAction SilentlyContinue
        if ($found) { $php = "php"; break }
    } elseif (Test-Path $candidate) {
        $php = $candidate
        break
    }
}

if (-not $php) {
    # Laragon – libovolná verze v bin/php
    $laragonPhp = Get-ChildItem "C:\laragon\bin\php\*\php.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($laragonPhp) { $php = $laragonPhp.FullName }
}

if (-not $php) {
    Write-Host ""
    Write-Host "PHP neni nainstalovane." -ForegroundColor Red
    Write-Host ""
    Write-Host "Admin potrebuje PHP (staticky Live Server / npx serve vraci HTTP 405)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Nainstalujte Laragon: https://laragon.org/download/" -ForegroundColor Cyan
    Write-Host "2. V Laragonu zapnete MySQL, vytvorite DB a importujete api/setup.sql" -ForegroundColor Cyan
    Write-Host "3. Zkopirujte api/config.local.dev.php.example -> api/config.local.php" -ForegroundColor Cyan
    Write-Host "4. Spustte znovu: .\dev-server.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

if (-not (Test-Path "$root\api\config.local.php")) {
    Write-Host ""
    Write-Host "Chybi api/config.local.php" -ForegroundColor Red
    Write-Host "Zkopirujte api/config.local.dev.php.example -> api/config.local.php" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Server: http://localhost:$port/" -ForegroundColor Green
Write-Host "Admin:  http://localhost:$port/admin/" -ForegroundColor Green
Write-Host "Ukonceni: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

Set-Location $root
& $php -S "localhost:$port" router.php
