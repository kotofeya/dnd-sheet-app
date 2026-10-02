#!/bin/bash
# Builds "Mystara Character Sheet" (Windows, portable folder) from this project.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/release/Mystara Character Sheet"
EXE="Mystara Character Sheet.exe"
mkdir -p "$ROOT/release"
rm -rf "$OUT.tmp"; mkdir -p "$OUT.tmp"
cp -r "$ROOT/node_modules/electron/dist/." "$OUT.tmp/"
rm -f "$OUT.tmp/electron.exe" "$OUT.tmp/resources/default_app.asar"
python3 "$ROOT/_build/patch_exe.py" "$ROOT/node_modules/electron/dist/electron.exe" "$OUT.tmp/$EXE" "$ROOT/_build/icons.json"
APP="$OUT.tmp/resources/app"
mkdir -p "$APP/dist/data" "$APP/src"
cp "$ROOT"/dist/*.js "$APP/dist/"
cp "$ROOT"/dist/data/*.js "$APP/dist/data/"
cp "$ROOT/src/index.html" "$ROOT/src/style.css" "$APP/src/"
cp -r "$ROOT/src/js" "$APP/src/js"
cp "$ROOT/_build/mystara.ico" "$ROOT/_build/mystara.png" "$APP/"
# Same name as the development app, so both use the same saved characters (%APPDATA%\dnd-sheet-app).
cat > "$APP/package.json" <<'JSON'
{
  "name": "dnd-sheet-app",
  "version": "1.0.0",
  "description": "Mystara (BECMI) character sheet",
  "main": "dist/main.js"
}
JSON
rm -rf "$OUT"; mv "$OUT.tmp" "$OUT"
echo "Built: $OUT/$EXE"
