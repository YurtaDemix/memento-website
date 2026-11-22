#!/bin/bash
# MEMENTO Studio 3.4 — one-click launcher for macOS
cd "$(dirname "$0")" || exit 1
printf '\n✦ MEMENTO Studio 3.4\n\n'
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js не найден. Установи LTS с https://nodejs.org и запусти этот файл снова.'
  read -r -p 'Нажми Enter для закрытия…' _
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo 'npm не найден — переустанови Node.js LTS.'
  read -r -p 'Нажми Enter для закрытия…' _
  exit 1
fi
printf 'Открываем http://127.0.0.1:4173/\nЗакрой Terminal или нажми Control+C, чтобы остановить сайт.\n\n'
( sleep 2; open 'http://127.0.0.1:4173/' ) &
npm run start
