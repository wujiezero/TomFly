#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

COMMON="$TMP/common.sh"
UPDATER="$TMP/updater.sh"
sed \
    -e 's|^TOMFLY_DIR=.*|TOMFLY_DIR="'"$TMP"'/etc/tomfly"|' \
    -e 's|^TOMFLY_RUN=.*|TOMFLY_RUN="'"$TMP"'/var/run/tomfly"|' \
    -e 's|^TOMFLY_LOG=.*|TOMFLY_LOG="'"$TMP"'/tomfly.log"|' \
    -e 's|^GEODATA_DIR=.*|GEODATA_DIR="'"$TMP"'/etc/tomfly/geodata"|' \
    -e 's|^RULES_DIR=.*|RULES_DIR="'"$TMP"'/etc/tomfly/rules"|' \
    "$ROOT/packages/tomfly-core/root/usr/lib/tomfly/common.sh" > "$COMMON"
sed 's|^\. /usr/lib/tomfly/common.sh$|. "'"$COMMON"'"|' \
    "$ROOT/packages/tomfly-core/root/usr/lib/tomfly/updater.sh" > "$UPDATER"

(
    TOMFLY_REF=feature-test
    . "$UPDATER"
    _tomfly_write_core_version 18
)

version_file="$TMP/etc/tomfly/core.version"
grep -Fx 'ref=feature-test' "$version_file" >/dev/null
grep -Eq '^updated_at=[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$' "$version_file"
grep -Fx 'files=18' "$version_file" >/dev/null

mtime() {
    stat -f %m "$1" 2>/dev/null || stat -c %Y "$1"
}

apk_db="$TMP/apk-installed"
opkg_status="$TMP/opkg-status"
: > "$apk_db"
: > "$opkg_status"
apk_before=$(mtime "$apk_db")
opkg_before=$(mtime "$opkg_status")
sleep 1

(
    TOMFLY_LUCI_APK_DB="$apk_db"
    TOMFLY_LUCI_OPKG_STATUS="$opkg_status"
    . "$UPDATER"
    _tomfly_bump_luci_resource_version
)

apk_after=$(mtime "$apk_db")
opkg_after=$(mtime "$opkg_status")
[ "$apk_after" -gt "$apk_before" ]
[ "$opkg_after" -gt "$opkg_before" ]
