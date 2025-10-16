@echo off
pushd %~dp0

set "PORT=8080"

start "PianoTrainer server" cmd /c "python -m http.server %PORT%"

timeout /t 1 /nobreak > nul

start "" "http://localhost:%PORT%/index.html"

popd
