@echo off
setlocal enabledelayedexpansion

:: Require one dropped file
if "%~1"=="" goto :ShowUsage

set "INPUT=%~1"
if not exist "%INPUT%" (
  echo.
  echo ERROR: File not found:
  echo   "%INPUT%"
  echo.
  echo Press any key to Exit.
  pause>nul
  exit /b 1
)

set "INPUT=%INPUT:'=''%"
set "NAME=%~n1"
set "EXT=%~x1"
set "TASKNAME=Elevated - %~n1"
set "DESKTOP_SHORTCUT_NAME=%NAME% (Elevated).lnk"

:: Will hold final EXE path the task should run
set "TR_FOR_SCHTASKS="
:: Will hold the EXE's folder (where launcher BAT will be created)
set "PROGRAM_DIR="

:: If the file itself is an .exe
if /I "%EXT%"==".exe" (
  set "TR_FOR_SCHTASKS=%~f1"
  set "PROGRAM_DIR=%~dp1"
  goto :main_common
)

:: If the file is a .lnk, resolve the shortcut target
if /I "%EXT%"==".lnk" (
  for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command ^
    "$p='%INPUT%';" ^
    "try{" ^
    " $sh = New-Object -ComObject WScript.Shell;" ^
    " $lnk = $sh.CreateShortcut((Resolve-Path $p));" ^
    " $t = $lnk.TargetPath;" ^
    " if([string]::IsNullOrWhiteSpace($t)){''} else {$t}" ^
    "}catch{''}"`) do (
    set "TARGET=%%T"
  )

  if not defined TARGET (
    echo.
    echo Result: The shortcut could not be resolved or has no target.
    echo.
    echo Press any key to Exit.
    pause>nul
    exit /b 1
  )

  :: Get target extension
  set "T_EXT="
  for %%E in ("!TARGET!") do set "T_EXT=%%~xE"

  if /I "!T_EXT!"==".exe" (
    set "TR_FOR_SCHTASKS=!TARGET!"
    for %%D in ("!TARGET!") do set "PROGRAM_DIR=%%~dpD"
    goto :main_common
  ) else (
    echo.
    echo Result: The dropped file is a SHORTCUT, but the target is not a program.
    echo Shortcut target: "!TARGET!"
    echo.
    echo Press any key to Exit.
    pause>nul
    exit /b 1
  )
)

goto :ShowUsage


:main_common
if not defined PROGRAM_DIR (
  echo.
  echo ERROR: Could not determine the program folder.
  echo.
  echo Press any key to Exit.
  pause>nul
  exit /b 1
)

:: Compute launcher BAT path and name (inside the program folder)
set "LAUNCHER_NAME=%NAME% (Elevated).bat"
set "LAUNCHER_PATH=%PROGRAM_DIR%%LAUNCHER_NAME%"

:: Elevate
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo Elevation required. Prompting for administrator...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\" \"%INPUT%\"\"' -Verb RunAs" 2>nul
  exit /b
)

:: Remove existing task if present
schtasks /Query /TN "%TASKNAME%" >nul 2>&1
if not errorlevel 1 (
  echo.
  echo Task "%TASKNAME%" exists. Deleting...
  schtasks /Delete /TN "%TASKNAME%" /F >nul 2>&1
)


echo.
echo Run:
echo powershell -Command "try { Register-ScheduledTask -TaskName \"%TASKNAME%\" -Action (New-ScheduledTaskAction -Execute \"%TR_FOR_SCHTASKS%\") -RunLevel Highest -Force -ErrorAction Stop } catch { exit 1 }"
echo.

powershell -Command "try { Register-ScheduledTask -TaskName \"%TASKNAME%\" -Action (New-ScheduledTaskAction -Execute \"%TR_FOR_SCHTASKS%\") -RunLevel Highest -Force -ErrorAction Stop } catch { exit 1 }"
if errorlevel 1 (
  echo.
  echo ERROR: Failed to create task "%TASKNAME%".
  echo.
  echo Press any key to Exit.
  pause>nul
  exit /b 1
)

echo.
echo Task created.
echo.

:: --------------------------------------------
:: Create/Update launcher BAT in program folder
:: --------------------------------------------
if not exist "%PROGRAM_DIR%" (
  echo.
  echo ERROR: Program folder not found:
  echo   "%PROGRAM_DIR%"
  echo.
  echo Press any key to Exit.
  pause>nul
  exit /b 1
)

echo Creating/Updating launcher: "%LAUNCHER_PATH%"
> "%LAUNCHER_PATH%" (
  echo schtasks /run /tn "%TASKNAME%"
)
echo.
echo Launcher created.
echo.

:: ----------------------------------------------------------
:: Create Desktop shortcut that points to the launcher script
:: ----------------------------------------------------------
for /f "usebackq tokens=2,*" %%A in (`reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul`) do (
  if /I "%%A"=="REG_SZ" set "DESKTOP_DIR=%%B"
)
if not defined DESKTOP_DIR (
  set "DESKTOP_DIR=%USERPROFILE%\Desktop"
)

set "SHORTCUT_PATH=%DESKTOP_DIR%\%DESKTOP_SHORTCUT_NAME%"

set "SHORTCUT_PATH=%SHORTCUT_PATH:'=''%"
set "LAUNCHER_PATH=%LAUNCHER_PATH:'=''%"
set "TR_FOR_SCHTASKS=%TR_FOR_SCHTASKS:'=''%"
set "NAME=%NAME:'=''%"

echo Creating desktop shortcut: "%SHORTCUT_PATH%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $ws=New-Object -ComObject WScript.Shell;" ^
  "$lnk=$ws.CreateShortcut('%SHORTCUT_PATH%');" ^
  "$lnk.TargetPath='%LAUNCHER_PATH%';" ^
  "$lnk.WorkingDirectory='%PROGRAM_DIR%';" ^
  "$lnk.IconLocation='%TR_FOR_SCHTASKS%,0';" ^
  "$lnk.Description='Run %NAME% elevated without UAC prompt';" ^
  "$lnk.WindowStyle=7;" ^
  "$lnk.Save() } catch { exit 1 }"
if errorlevel 1 (
  echo.
  echo ERROR: Failed to create shortcut "%DESKTOP_DIR%\%DESKTOP_SHORTCUT_NAME%".
  echo.
  echo Press any key to Exit.
  pause>nul
  exit /b 1
)

echo.
echo Shortcut created.
echo.
echo Press any key to Exit.
::pause>nul
exit /b 0


:ShowUsage
echo.
echo ---------------------------------------------------------
echo  Create shortcut to run as admin without UAC prompt
echo  with a launcher script using Task Scheduler
echo ---------------------------------------------------------
echo  Drag and drop a program/shortcut onto this .bat
echo.
echo  or run from CMD:
echo    "%~nx0" "C:\Path\To\YourApp.exe"
echo ---------------------------------------------------------
echo.
echo Press any key to Exit.
pause>nul
exit /b 1
