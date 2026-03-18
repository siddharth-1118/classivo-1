@echo off
cd /d "c:\Vertex\backend"
set DEV_MODE=true
set PORT=7860
go run src/main.go
