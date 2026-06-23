<p align="center">
  <img src="docs/logo.png" alt="TomFly" width="120" />
</p>

# TomFly

A clean, native-LuCI transparent proxy plugin for ImmortalWrt 25.12.0+ / OpenWrt 22.03+,
powered by [mihomo](https://github.com/MetaCubeX/mihomo) and [sing-box](https://github.com/SagerNet/sing-box).

> Languages: English · [简体中文](README.zh-CN.md)

## Features

- **Native LuCI UI** — pure JS views rendered as top tabs under *Services → TomFly*, matches the router theme (light/dark)
- **Multiple protocols** — VLESS+Reality, VMess, Trojan, Shadowsocks (incl. 2022), Hysteria2, TUIC v5, AnyTLS
- **One-line import** — paste any `vless://` / `vmess://` / `ss://` / `hy2://` / `tuic://` / `anytls://` … URI
- **Kernel-aware** — a capability matrix skips nodes the active kernel can't run (e.g. mihomo + anytls-reality), and the config is validated before each (re)start so one bad node can't take the service down
- **Two transparent-proxy data-planes** — TPROXY (default) or TUN, switched from the UI and mutually exclusive (see below)
- **Smart routing** — GeoIP + GeoSite + custom force-proxy / force-direct rules
- **Dual kernel** — switch between mihomo and sing-box without reinstalling
- **Online update** — pull kernels and GeoData from the web UI or CLI

## One-click Install

```sh
curl -fsSL https://cdn.jsdelivr.net/gh/wujiezero/TomFly@main/install.sh | sh
```

It installs dependencies (`nftables`, `kmod-nft-tproxy`, `kmod-tun`, `ip-full`, `rpcd-mod-file`, …),
deploys the scripts + web UI, and optionally downloads the mihomo kernel and GeoData.

After install, open: **`http://<router-ip>/cgi-bin/luci/admin/services/tomfly`**

To remove it: `curl -fsSL https://cdn.jsdelivr.net/gh/wujiezero/TomFly@main/uninstall.sh | sh`
(add `PURGE=1` to also delete saved nodes, kernels, geodata and logs).

## Kernel & GeoData downloads (manual install / offline)

`tomfly update mihomo|singbox|geodata|all` (or the **Kernel** tab) fetches everything automatically and
picks the right architecture for you. If your router has no GitHub access, download the files on another
machine and drop them in via the Kernel tab's **upload** button, or `scp` them to the paths below.

**First, find your architecture** on the router:

```sh
. /etc/openwrt_release; echo "$DISTRIB_ARCH"   # e.g. x86_64, aarch64_cortex-a53, arm_cortex-a7_neon-vfpv4
uname -m                                        # fallback: x86_64, aarch64, armv7l, mips, mipsel
```

**Pick the matching asset** (this is exactly what `detect_arch()` maps to):

| Router arch (`DISTRIB_ARCH` / `uname -m`) | asset arch token |
|---|---|
| `x86_64`                                  | `linux-amd64` |
| `i386*` / `i686`                          | `linux-386` |
| `aarch64*` / `aarch64`                    | `linux-arm64` |
| `arm_*` with neon/vfp (Cortex-A) / `armv7l` | `linux-armv7` |
| older `arm_*` / `armv5*`                  | `linux-armv5` |
| `mipsel_*` / `mipsel`                     | `linux-mipsle-softfloat` |
| `mips_*` / `mips`                         | `linux-mips-softfloat` |
| `mips64el_*`                              | `linux-mips64le` |
| `mips64_*`                                | `linux-mips64` |

> On `x86_64`, the `-compatible` mihomo build runs on every CPU (no AVX requirement) and is the safe pick.

**mihomo** — releases: <https://github.com/MetaCubeX/mihomo/releases>
Asset name: `mihomo-<arch>-<version>.gz` (e.g. `mihomo-linux-arm64-v1.19.27.gz`). Then:

```sh
gzip -d mihomo-linux-arm64-v1.19.27.gz
install -m755 mihomo-linux-arm64-v1.19.27 /usr/bin/mihomo
```

**sing-box** — releases: <https://github.com/SagerNet/sing-box/releases>
Asset name: `sing-box-<version>-<arch>.tar.gz` (e.g. `sing-box-1.13.12-linux-arm64.tar.gz`). Then:

```sh
tar -xzf sing-box-1.13.12-linux-arm64.tar.gz
install -m755 sing-box-*/sing-box /usr/bin/sing-box
```

**Geo rule files** (architecture-independent) — all live under `/etc/tomfly/geodata/`.
mihomo and sing-box use **different formats**. The Kernel tab shows two separate cards; update or upload each set independently.

### mihomo GeoData (`.dat`)

Powers mihomo `GEOSITE` / `GEOIP` routing rules.

| File | Purpose |
|------|---------|
| `geoip.dat` | GeoIP rules for mainland China |
| `geosite.dat` | GeoSite rules for mainland China |

**Source:** [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat/releases) releases.

```sh
# Online update (mihomo .dat only)
tomfly update geodata_mihomo

# Manual copy
cp geoip.dat geosite.dat /etc/tomfly/geodata/
```

jsDelivr mirrors:

- `https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat`
- `https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat`

**LuCI:** *Services → TomFly → Kernel* → **mihomo GeoData** card → *Update online* or *Upload* (`geoip.dat` / `geosite.dat` or a `.tar.gz` bundle).

### sing-box Rule-Sets (`.srs`)

Powers sing-box `geoip-cn` / `geosite-cn` rules. The generated config **prefers local files**; without them sing-box tries CDN (often blocked in China — upload offline copies).

| File | Purpose |
|------|---------|
| `geoip-cn.srs` | GeoIP CN binary rule-set |
| `geosite-cn.srs` | GeoSite CN binary rule-set |

**Download URLs:**

- `https://cdn.jsdelivr.net/gh/SagerNet/sing-geoip@rule-set/geoip-cn.srs`
- `https://cdn.jsdelivr.net/gh/SagerNet/sing-geosite@rule-set/geosite-cn.srs`

(Raw fallback: `https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs`, etc.)

```sh
# Online update (sing-box .srs only)
tomfly update geodata_singbox

# Manual copy (recommended when CDN is unreachable)
cp geoip-cn.srs geosite-cn.srs /etc/tomfly/geodata/
tomfly restart
```

**LuCI:** *Kernel* tab → **sing-box Rule-Sets** card → *Upload* `geoip-cn.srs` / `geosite-cn.srs` (one file per upload is fine).

### Update everything at once

```sh
tomfly update geodata    # tries both mihomo .dat and sing-box .srs
tomfly update all        # kernels + all geo files
```

## Supported Protocols

| Protocol | URI Scheme | mihomo | sing-box |
|---|---|---|---|
| VLESS | `vless://` | ✓ (Reality / Vision / ws / grpc) | ✓ |
| VMess | `vmess://` | ✓ | ✓ |
| Trojan | `trojan://` | ✓ | ✓ |
| Shadowsocks | `ss://` | ✓ (2022 / AEAD) | ✓ |
| Hysteria2 | `hy2://` · `hysteria2://` | ✓ | ✓ |
| TUIC v5 | `tuic://` | ✓ | ✓ |
| AnyTLS | `anytls://` | ✓ (**no** Reality) | ✓ (Reality OK) |

> mihomo does **not** support AnyTLS + Reality — such a node is auto-skipped on mihomo; switch to
> sing-box, or use a VLESS/Trojan Reality node. `naive` is not a kernel outbound and is unsupported.

## TPROXY vs TUN

Both transparently proxy the router **and** every LAN device that uses it as gateway — they are just two
mechanisms, and only one runs at a time:

- **TPROXY** (default): tomfly's `nftables` redirects traffic to the kernel's tproxy port. Battle-tested.
- **TUN**: the kernel creates a `tun` device and owns routing via `auto-route` + `auto-redirect`; tomfly's
  nftables/policy-routing step is skipped. Requires `kmod-tun`. If the TUN interface fails to come up
  (e.g. a virtualized host without `/dev/net/tun`), tomfly automatically falls back to TPROXY.

sing-box is always TUN. Toggle TUN for mihomo in *Overview → Quick Settings*.

> **LXC/Proxmox note:** an unprivileged container needs the host to load `tun` and pass the device in —
> on the PVE host: `modprobe tun` (persist via `/etc/modules-load.d/`), and in the container config add
> `lxc.cgroup2.devices.allow: c 10:200 rwm` and
> `lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file`, then restart the container.

## CLI Usage

```sh
tomfly add "vless://uuid@host:port?security=reality&..."   # add a node
tomfly list                                                # list nodes
tomfly test <node-id>                                      # test connectivity
tomfly start | stop | restart | status                     # service control
tomfly update mihomo | singbox | geodata | geodata_mihomo | geodata_singbox | all   # online update
```

## Package Structure

```
packages/
├── tomfly-core/        # core shell scripts + init.d service
├── luci-app-tomfly/    # native LuCI JS views + rpcd ACL
└── tomfly-geodata/     # default rule files
```

## Architecture

```
Native LuCI JS views ──ubus(file.exec)/uci──> shell CLI (/usr/bin/tomfly)
                                                   │
                                       UCI config ←┘→ gen_mihomo / gen_singbox
                                                   │
                                          mihomo / sing-box kernel
                                                   │
                                    nftables TPROXY  ──or──  kernel TUN
```

## Requirements

- ImmortalWrt 25.12.0+ / OpenWrt 22.03+ (`apk` or `opkg`)
- Architecture: x86_64, aarch64, armv7/armv5, mips(le); 386 / mips64 best-effort
- RAM: ≥64 MB free (128 MB+ recommended for mihomo)
- Storage: ≥16 MB free

## License

MIT
