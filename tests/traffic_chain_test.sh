#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

COMMON="$TMP/common.sh"
TRAFFIC="$TMP/traffic.sh"
BIN="$TMP/bin"
mkdir -p "$BIN"

sed \
    -e 's|^TOMFLY_DIR=.*|TOMFLY_DIR="'"$TMP"'/etc/tomfly"|' \
    -e 's|^TOMFLY_RUN=.*|TOMFLY_RUN="'"$TMP"'/var/run/tomfly"|' \
    -e 's|^TOMFLY_LOG=.*|TOMFLY_LOG="'"$TMP"'/tomfly.log"|' \
    -e 's|^GEODATA_DIR=.*|GEODATA_DIR="'"$TMP"'/etc/tomfly/geodata"|' \
    -e 's|^RULES_DIR=.*|RULES_DIR="'"$TMP"'/etc/tomfly/rules"|' \
    -e 's|^MIHOMO_PID=.*|MIHOMO_PID="'"$TMP"'/var/run/tomfly-mihomo.pid"|' \
    -e 's|^SINGBOX_PID=.*|SINGBOX_PID="'"$TMP"'/var/run/tomfly-singbox.pid"|' \
    "$ROOT/packages/tomfly-core/root/usr/lib/tomfly/common.sh" > "$COMMON"
sed 's|^\. /usr/lib/tomfly/common.sh$|. "'"$COMMON"'"|' \
    "$ROOT/packages/tomfly-core/root/usr/lib/tomfly/traffic.sh" \
    | sed \
        -e 's|^TRAFFIC_DB=.*|TRAFFIC_DB="'"$TMP"'/var/run/tomfly/traffic_month.json"|' \
        -e 's|^CONN_SEEN=.*|CONN_SEEN="'"$TMP"'/var/run/tomfly/conn_seen"|' \
    > "$TRAFFIC"

cat > "$BIN/uci" <<'SH'
#!/bin/sh
case "$*" in
    "-q get tomfly.global.traffic_stats") echo 1 ;;
    "show tomfly") echo "tomfly.proxy_abcd.type='vless'" ;;
    "-q get tomfly.proxy_abcd.name") echo "node-a" ;;
esac
SH
chmod +x "$BIN/uci"

cat > "$BIN/curl" <<'SH'
#!/bin/sh
cat <<'JSON'
{"downloadTotal":1200,"uploadTotal":80,"connections":[{"id":"conn-1","metadata":{"network":"tcp"},"upload":80,"download":1120,"chains":["node-a","AUTO","PROXY"]}]}
JSON
SH
chmod +x "$BIN/curl"

cat > "$BIN/jsonfilter" <<'SH'
#!/bin/sh
exit 0
SH
chmod +x "$BIN/jsonfilter"

PATH="$BIN:$PATH"
export PATH

. "$TRAFFIC"
echo "$$" > "$MIHOMO_PID"

out=$(tomfly_traffic)
echo "$out" | grep -Eq '"node-a":[1-9][0-9]*'
