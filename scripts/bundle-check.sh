#!/usr/bin/env bash
set -e

echo "=== Checking Android bundle export ==="
cd app
npx expo export --platform android
echo "=== Android bundle export OK ==="
