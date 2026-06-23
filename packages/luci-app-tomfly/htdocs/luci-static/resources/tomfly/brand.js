'use strict';
'require baseclass';

return baseclass.extend({
	header: function (pageTitle) {
		var row = E('div', { 'class': 'tomfly-brand-main' }, [
			E('img', {
				'class': 'tomfly-logo',
				'src': L.resource('view/tomfly/logo.png'),
				'alt': 'TomFly'
			}),
			E('div', { 'class': 'tomfly-brand-text' }, [
				E('div', { 'class': 'tomfly-brand-title' }, 'TomFly'),
				E('div', { 'class': 'tomfly-brand-tagline' },
					_('Transparent proxy · mihomo & sing-box'))
			])
		]);
		if (pageTitle)
			row.appendChild(E('div', { 'class': 'tomfly-brand-page' }, pageTitle));
		return E('div', { 'class': 'tomfly-brand' }, [row]);
	},

	page: function (pageTitle, children) {
		var nodes = Array.isArray(children) ? children : [children];
		return E('div', { 'class': 'tomfly' }, [this.header(pageTitle)].concat(nodes));
	}
});
