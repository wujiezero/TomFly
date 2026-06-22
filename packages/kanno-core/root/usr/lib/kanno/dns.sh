#!/bin/sh
# KannoProxy - dnsmasq integration

. /usr/lib/kanno/common.sh

DNSMASQ_CONF="/tmp/dnsmasq.d/kanno.conf"   # legacy path, cleaned up on teardown
DNS_PORT=1053   # mihomo/sing-box fake-ip DNS listen port

# Modern OpenWrt/ImmortalWrt dnsmasq uses an INSTANCE-specific conf-dir
# (/tmp/dnsmasq.<id>.d), so dropping a file in /tmp/dnsmasq.d is silently
# ignored. Configure through UCI instead so the setting lands in dnsmasq's
# own generated config: forward every query to mihomo's fake-ip resolver.
setup_dns() {
    rm -f "$DNSMASQ_CONF" 2>/dev/null   # remove any stale legacy file

    uci -q del_list dhcp.@dnsmasq[0].server="127.0.0.1#${DNS_PORT}" 2>/dev/null
    uci add_list dhcp.@dnsmasq[0].server="127.0.0.1#${DNS_PORT}"
    uci set dhcp.@dnsmasq[0].noresolv='1'
    uci commit dhcp

    if /etc/init.d/dnsmasq restart 2>/dev/null; then
        log_info "dnsmasq configured for kanno DNS (127.0.0.1#${DNS_PORT})"
    else
        log_warn "dnsmasq restart failed"
    fi
}

teardown_dns() {
    rm -f "$DNSMASQ_CONF" 2>/dev/null
    uci -q del_list dhcp.@dnsmasq[0].server="127.0.0.1#${DNS_PORT}" 2>/dev/null
    uci -q delete dhcp.@dnsmasq[0].noresolv 2>/dev/null
    uci commit dhcp
    if /etc/init.d/dnsmasq restart 2>/dev/null; then
        log_info "dnsmasq DNS restored"
    else
        log_warn "dnsmasq restart failed"
    fi
}
