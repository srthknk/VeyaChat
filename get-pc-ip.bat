@echo off
REM Get PC IP Address and show mobile setup instructions

echo.
echo ========================================
echo   CHATAPP MOBILE TESTING SETUP
echo ========================================
echo.

REM Get IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "IP=%%a"
)

REM Remove leading space
set "IP=%IP:~1%"

if "%IP%"=="" (
    echo ERROR: Could not find IPv4 address
    echo.
    echo MANUAL METHOD:
    echo 1. Open PowerShell
    echo 2. Run: ipconfig
    echo 3. Find "IPv4 Address" - that's your PC IP
    echo 4. Update frontend/.env with that IP
    pause
    exit /b 1
)

echo Your PC IP Address: %IP%
echo.
echo ========================================
echo   HOW TO TEST ON MOBILE
echo ========================================
echo.
echo 1. Update frontend/.env:
echo    VITE_API_URL=http://%IP%:5000
echo    VITE_SOCKET_URL=http://%IP%:5000
echo.
echo 2. On your phone (same WiFi):
echo    http://%IP%:5173/
echo.
echo 3. Make sure:
echo    - Both servers running
echo    - Phone on same WiFi
echo    - Backend running on 5000
echo    - Frontend running on 5173
echo.
echo ========================================
echo.

REM Optional: Copy to clipboard (Windows)
echo Your IP: %IP%
echo.
echo Copy this for your frontend/.env:
echo VITE_API_URL=http://%IP%:5000
echo VITE_SOCKET_URL=http://%IP%:5000
echo.
echo Copy this for your phone browser:
echo http://%IP%:5173/
echo.

pause
