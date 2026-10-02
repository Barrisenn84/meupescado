@echo off
title Meu Pescado - Gerador de Link Publico (Acesso Total)
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0gerar_link_publico.ps1"
pause
