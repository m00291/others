@echo off
ffmpeg -i %1 -codec copy %~n1.mp4