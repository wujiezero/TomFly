'use strict';

/* Kernel-specific UI capabilities — keep in sync with tomfly-core dataplane logic. */
return {
	profile: function (kernel) {
		var sb = kernel === 'singbox';
		return {
			kernel: sb ? 'singbox' : 'mihomo',
			label: sb ? 'sing-box' : 'mihomo',
			tunConfigurable: !sb,
			tunAlwaysOn: sb,
			nodeTestAccurate: !sb,
			geoRemote: sb,
			dnsFirstOnly: sb,
			groupsInConfig: false
		};
	},

	badge: function (kernel) {
		var p = this.profile(kernel);
		return E('span', {
			'class': 'tomfly-pill tomfly-kernel-pill ' + (p.kernel === 'singbox' ? 'tomfly-pill-sb' : 'tomfly-pill-mh')
		}, p.label);
	}
};
