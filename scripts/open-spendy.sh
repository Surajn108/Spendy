#!/usr/bin/env bash
# Open Spendy in the default browser (waits briefly for the server).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="${SPENDY_URL:-http://127.0.0.1:3000}"

sleep "${SPENDY_OPEN_DELAY:-2}"

if command -v open >/dev/null 2>&1; then
  exec open "$URL"
fi
if command -v xdg-open >/dev/null 2>&1; then
  exec xdg-open "$URL"
fi

echo "Could not find open or xdg-open. Visit: $URL" >&2
exit 1
