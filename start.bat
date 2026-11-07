@echo off
title Game Co X-O Localhost Server
echo ===================================================
echo   Dang khoi dong Web Server Localhost...
echo ===================================================

:: Tu dong mo trinh duyet sau 1 giay
start "" http://localhost:3000

:: Chay server nodejs
node server.js

pause

