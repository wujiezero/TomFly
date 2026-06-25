#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OVERVIEW="$ROOT/packages/luci-app-tomfly/htdocs/luci-static/resources/view/tomfly/overview.js"

sed -n '441,470p' "$OVERVIEW" | grep -q 'fmtBytes(bytes)'
! sed -n '441,470p' "$OVERVIEW" | grep -q "toFixed(2) + ' GB'"
