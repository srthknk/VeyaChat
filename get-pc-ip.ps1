#!/usr/bin/env powershell
# Get PC IP Address and show mobile setup instructions

Write-Host ""
Write-Host "========================================"
Write-Host "  CHATAPP MOBILE TESTING SETUP"
Write-Host "========================================"
Write-Host ""

# Get IPv4 address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    # Try alternative method
    $ipAddress = (Get-NetIPConfiguration | Where-Object {$null -ne $_.IPv4DefaultGateway} | Select-Object -First 1 -ExpandProperty IPv4Address).IPAddress[0]
}

if (-not $ipAddress) {
    Write-Host "ERROR: Could not find IPv4 address" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL METHOD:" -ForegroundColor Yellow
    Write-Host "1. Open PowerShell"
    Write-Host "2. Run: ipconfig"
    Write-Host "3. Find 'IPv4 Address' - that's your PC IP"
    Write-Host "4. Update frontend/.env with that IP"
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Your PC IP Address: $ipAddress" -ForegroundColor Green
Write-Host ""
Write-Host "========================================"
Write-Host "  HOW TO TEST ON MOBILE"
Write-Host "========================================"
Write-Host ""

Write-Host "1. UPDATE frontend/.env:" -ForegroundColor Yellow
Write-Host "   VITE_API_URL=http://$($ipAddress):5000"
Write-Host "   VITE_SOCKET_URL=http://$($ipAddress):5000"
Write-Host ""

Write-Host "2. ON YOUR PHONE (same WiFi):" -ForegroundColor Yellow
Write-Host "   http://$($ipAddress):5173/"
Write-Host ""

Write-Host "3. MAKE SURE:" -ForegroundColor Yellow
Write-Host "   ✓ Both servers running"
Write-Host "   ✓ Phone on same WiFi"
Write-Host "   ✓ Backend running on 5000"
Write-Host "   ✓ Frontend running on 5173"
Write-Host ""

Write-Host "========================================"
Write-Host ""

Write-Host "COPY THIS TO frontend/.env:" -ForegroundColor Cyan
Write-Host "VITE_API_URL=http://$($ipAddress):5000"
Write-Host "VITE_SOCKET_URL=http://$($ipAddress):5000"
Write-Host ""

Write-Host "COPY THIS TO YOUR PHONE:" -ForegroundColor Cyan
Write-Host "http://$($ipAddress):5173/"
Write-Host ""

# Save to env file option
$response = Read-Host "Update frontend/.env automatically? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    $envPath = "frontend/.env"
    @"
VITE_API_URL=http://$($ipAddress):5000
VITE_SOCKET_URL=http://$($ipAddress):5000
"@ | Set-Content $envPath
    Write-Host "✓ Updated $envPath" -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to continue"
