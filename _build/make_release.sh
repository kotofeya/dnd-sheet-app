#!/bin/bash
# Builds "Mystara Character Sheet" (Windows, portable folder) from this project.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/release/Mystara Character Sheet"
EXE="Mystara Character Sheet.exe"
mkdir -p "$ROOT/release"
# Stop before touching anything if the app is open (Windows locks the running exe and its DLLs).
if [ -f "$OUT/$EXE" ] && ! python3 -c "import sys; open(sys.argv[1], 'r+b').close()" "$OUT/$EXE" 2>/dev/null; then
    echo "The app is open: close Mystara Character Sheet and build again."; exit 1
fi
if [ -d "$OUT" ]; then rm -rf "$OUT.old"; mv "$OUT" "$OUT.old"; fi
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
# Saved characters live in %APPDATA%\Mystara Character Sheet (set in main.ts).
cat > "$APP/package.json" <<'JSON'
{
  "name": "dnd-sheet-app",
  "version": "1.0.0",
  "description": "Mystara (BECMI) character sheet",
  "main": "dist/main.js"
}
JSON
mv "$OUT.tmp" "$OUT"
rm -rf "$OUT.old"
echo "Built: $OUT/$EXE"
