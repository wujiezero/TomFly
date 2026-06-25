#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

COMMON="$TMP/common.sh"
sed \
    -e 's|^TOMFLY_DIR=.*|TOMFLY_DIR="'"$TMP"'/etc/tomfly"|' \
    -e 's|^TOMFLY_RUN=.*|TOMFLY_RUN="'"$TMP"'/var/run/tomfly"|' \
    -e 's|^TOMFLY_LOG=.*|TOMFLY_LOG="'"$TMP"'/tomfly.log"|' \
    -e 's|^GEODATA_DIR=.*|GEODATA_DIR="'"$TMP"'/etc/tomfly/geodata"|' \
    -e 's|^RULES_DIR=.*|RULES_DIR="'"$TMP"'/etc/tomfly/rules"|' \
    "$ROOT/packages/tomfly-core/root/usr/lib/tomfly/common.sh" > "$COMMON"

(
    . "$COMMON"
    log_info "TomFly starting..." >/dev/null
    log_warn "skipping node x" >/dev/null 2>/dev/null
    log_error "kernel config invalid" >/dev/null 2>/dev/null
)

assert_re() {
    line="$1"
    pattern="$2"
    if ! printf '%s\n' "$line" | grep -Eq "$pattern"; then
        printf 'line did not match:\n%s\npattern:\n%s\n' "$line" "$pattern" >&2
        return 1
    fi
}

line1=$(sed -n '1p' "$TMP/tomfly.log")
line2=$(sed -n '2p' "$TMP/tomfly.log")
line3=$(sed -n '3p' "$TMP/tomfly.log")

ts='[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'
assert_re "$line1" "^${ts} \\[INFO\\]  TomFly starting\\.\\.\\.$"
assert_re "$line2" "^${ts} \\[WARN\\]  skipping node x$"
assert_re "$line3" "^${ts} \\[ERROR\\] kernel config invalid$"
