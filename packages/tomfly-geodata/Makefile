include $(TOPDIR)/rules.mk

PKG_NAME:=tomfly-geodata
PKG_VERSION:=0.1.1
PKG_RELEASE:=1
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/tomfly-geodata
  SECTION:=net
  CATEGORY:=Network
  TITLE:=TomFly GeoData and Rule Files
  DEPENDS:=+tomfly-core
  PKGARCH:=all
endef

define Package/tomfly-geodata/description
  Default rule files for TomFly. GeoIP/GeoSite data files
  are downloaded at runtime via 'tomfly update geodata'.
endef

define Build/Prepare
endef

define Build/Compile
endef

define Package/tomfly-geodata/install
  $(INSTALL_DIR) $(1)/etc/tomfly/rules
  $(INSTALL_DIR) $(1)/etc/tomfly/geodata

  $(INSTALL_DATA) ./root/etc/tomfly/rules/force_proxy.txt  $(1)/etc/tomfly/rules/
  $(INSTALL_DATA) ./root/etc/tomfly/rules/force_direct.txt $(1)/etc/tomfly/rules/
endef

define Package/tomfly-geodata/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] && exit 0
echo "Downloading GeoData (GeoIP + GeoSite)..."
tomfly update geodata || echo "GeoData download failed, retry with: tomfly update geodata"
exit 0
endef

$(eval $(call BuildPackage,tomfly-geodata))
