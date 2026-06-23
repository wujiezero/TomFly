#!/bin/sh
# TomFly - shared utilities

TOMFLY_DIR="/etc/tomfly"
TOMFLY_RUN="/var/run/tomfly"
TOMFLY_LOG="/var/log/tomfly.log"
MIHOMO_BIN="/usr/bin/mihomo"
SINGBOX_BIN="/usr/bin/sing-box"
MIHOMO_CFG="/etc/tomfly/mihomo/config.yaml"
SINGBOX_CFG="/etc/tomfly/singbox/config.json"
GEODATA_DIR="/etc/tomfly/geodata"
RULES_DIR="/etc/tomfly/rules"
MIHOMO_PID="/var/run/tomfly-mihomo.pid"
SINGBOX_PID="/var/run/tomfly-singbox.pid"
MIHOMO_API="http://127.0.0.1:9090"

log_info()  {
    echo "[INFO]  $*" >> "$TOMFLY_LOG"
    logger -t tomfly -p daemon.info  "$*" 2>/dev/null
    printf '\033[0;32m[✓]\033[0m %s\n' "$*"
}
log_warn()  {
    echo "[WARN]  $*" >> "$TOMFLY_LOG"
    logger -t tomfly -p daemon.warn  "$*" 2>/dev/null
    printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2
}
log_error() {
    echo "[ERROR] $*" >> "$TOMFLY_LOG"
    logger -t tomfly -p daemon.err   "$*" 2>/dev/null
    printf '\033[0;31m[✗]\033[0m %s\n' "$*" >&2
}

tomfly_gen_id() {
    head -c 4 /dev/urandom | hexdump -e '1/4 "%08x"'
}

uci_get() { uci -q get "tomfly.$1" 2>/dev/null; }
uci_get_list() { uci -q get "tomfly.$1" 2>/dev/null; }

mkdir -p "$TOMFLY_RUN" "$TOMFLY_DIR/mihomo" "$TOMFLY_DIR/singbox" \
         "$GEODATA_DIR" "$RULES_DIR"
