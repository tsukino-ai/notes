@echo off
setlocal

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"
set "ROOT_DIR=%CD%"
popd
cd /d "%ROOT_DIR%"

if exist "%ROOT_DIR%\vendor\bun\bun.exe" (
    set "BUN_CMD=%ROOT_DIR%\vendor\bun\bun.exe"
    goto :run
)

where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "BUN_CMD=bun"
    goto :run
)

if exist "%USERPROFILE%\.bun\bin\bun.exe" (
    set "BUN_CMD=%USERPROFILE%\.bun\bin\bun.exe"
    goto :run
)

echo [ERROR] bun not found.
exit /b 1

:run
if "%CLAUDE_CODE_FORCE_RECOVERY_CLI%"=="1" (
    "%BUN_CMD%" --env-file=.env ./src/localRecoveryCli.ts %*
    exit /b %ERRORLEVEL%
)

"%BUN_CMD%" --env-file=.env ./src/entrypoints/cli.tsx %*
exit /b %ERRORLEVEL%
