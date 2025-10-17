@echo off
setlocal EnableExtensions
pushd %~dp0

set "PORT=8080"
set "ENTRY=src\main.js"
set "BUNDLE_OUT=dist\app.bundle.js"

where npx >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js/npm ^(npx^) not found in PATH. Please install Node.js from https://nodejs.org/ and re-run.
    popd
    exit /b 1
)

if not exist dist (
    mkdir dist
)

echo Bundling sources with esbuild...
call npx esbuild "%ENTRY%" --bundle --format=esm --loader:.css=text --minify --sourcemap --log-level=error --outfile="%BUNDLE_OUT%"
if errorlevel 1 (
    echo [ERROR] Bundling failed. Server not started.
    popd
    exit /b 1
)

start "PianoTrainer server" cmd /c "python -m http.server %PORT%"

timeout /t 1 /nobreak > nul

start "" "http://localhost:%PORT%/index.html"

popd
endlocal
