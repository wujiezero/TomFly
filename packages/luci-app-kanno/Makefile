include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-kanno
PKG_VERSION:=0.1.0
PKG_RELEASE:=1
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-kanno
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=KannoProxy - Beautiful Transparent Proxy UI
  DEPENDS:=+luci-base +kanno-core +rpcd +rpcd-mod-file
  PKGARCH:=all
endef

define Package/luci-app-kanno/description
  A beautiful and simple transparent proxy plugin UI for ImmortalWrt,
  supporting mihomo and sing-box kernels with rich protocol support.
  Built as native LuCI (client/JS) views — no Lua runtime required.
endef

define Build/Prepare
endef

define Build/Compile
endef

define Package/luci-app-kanno/install
  $(INSTALL_DIR) $(1)/www/luci-static/resources/kanno
  $(INSTALL_DIR) $(1)/www/luci-static/resources/view/kanno
  $(INSTALL_DIR) $(1)/usr/share/luci/menu.d
  $(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
  $(INSTALL_DIR) $(1)/etc/uci-defaults

  $(INSTALL_DATA) ./htdocs/luci-static/resources/kanno/api.js \
	$(1)/www/luci-static/resources/kanno/
  $(INSTALL_DATA) ./htdocs/luci-static/resources/view/kanno/style.css \
	$(1)/www/luci-static/resources/view/kanno/
  for v in overview nodes groups rules dns kernel log; do \
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/kanno/$$v.js \
		$(1)/www/luci-static/resources/view/kanno/ ; \
  done

  $(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-kanno.json $(1)/usr/share/luci/menu.d/
  $(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-kanno.json  $(1)/usr/share/rpcd/acl.d/

  $(INSTALL_BIN) ./root/etc/uci-defaults/90-luci-app-kanno $(1)/etc/uci-defaults/
endef

define Package/luci-app-kanno/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] && exit 0
rm -f /tmp/luci-indexcache /tmp/luci-indexcache.* 2>/dev/null
rm -rf /tmp/luci-modulecache 2>/dev/null
/etc/init.d/rpcd reload 2>/dev/null || true
/etc/init.d/uhttpd reload 2>/dev/null || true
exit 0
endef

$(eval $(call BuildPackage,luci-app-kanno))
