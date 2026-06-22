'use strict';
'require view';
'require ui';
'require kanno.api as api';

document.querySelector('head').appendChild(E('link', {
	'rel': 'stylesheet', 'type': 'text/css',
	'href': L.resource('view/kanno/style.css')
}));

function row(label, field) {
	return E('div', { 'class': 'cbi-value' }, [
		E('label', { 'class': 'cbi-value-title' }, label),
		E('div', { 'class': 'cbi-value-field' }, [field])
	]);
}

function select(id, value, opts) {
	var el = E('select', { 'class': 'cbi-input-select', 'id': id },
		opts.map(function (o) { return E('option', { 'value': o[0] }, o[1]); }));
	el.value = value;
	return el;
}

return view.extend({
	load: function () {
		return Promise.all([
			L.resolveDefault(api.call('get_global'), {}),
			L.resolveDefault(api.call('get_kernels'), {})
		]);
	},

	kernelCard: function (badge, cls, name, ver, installed, target, statusText) {
		return E('div', { 'class': 'kanno-card kanno-kernel' }, [
			E('div', { 'class': 'kanno-kernel-badge kanno-ic-' + cls }, badge),
			E('div', { 'class': 'kanno-kernel-name' }, name),
			E('div', { 'class': 'kanno-kernel-ver' }, ver || _('not installed')),
			E('div', { 'style': 'margin-bottom:10px' }, [
				E('span', { 'class': 'kanno-pill ' + (installed ? 'kanno-pill-on' : 'kanno-pill-off') }, statusText)
			]),
			E('button', {
				'class': 'cbi-button cbi-button-action important',
				'click': ui.createHandlerFn(this, 'handleUpdate', target)
			}, _('Update online'))
		]);
	},

	render: function (data) {
		var g = data[0] || {}, k = data[1] || {};
		var mihomo = k.mihomo || {}, singbox = k.singbox || {}, geo = k.geodata || {};
		var geoOk = (geo.geoip === 'yes' && geo.geosite === 'yes');

		return E('div', { 'class': 'kanno' }, [
			E('div', { 'class': 'kanno-card' }, [
				E('div', { 'class': 'kanno-card-title' }, _('Global Settings')),
				row(_('Active Kernel'), select('k-kernel', g.kernel || 'mihomo', [
					['mihomo', 'mihomo ' + _('(recommended)')], ['singbox', 'sing-box']
				])),
				row(_('Proxy Mode'), select('k-mode', g.mode || 'rule', [
					['rule', _('Rule')], ['global', _('Global')], ['direct', _('Direct')]
				])),
				row(_('Log Level'), select('k-log', g.log_level || 'info', [
					['silent', 'Silent'], ['error', 'Error'], ['warning', 'Warning'], ['info', 'Info'], ['debug', 'Debug']
				])),
				E('div', { 'class': 'cbi-value', 'style': 'border:none' }, [
					E('label', { 'class': 'cbi-value-title' }, ''),
					E('div', { 'class': 'cbi-value-field' }, [
						E('button', { 'class': 'cbi-button cbi-button-save important', 'click': ui.createHandlerFn(this, 'handleSaveGlobal') }, _('Save'))
					])
				])
			]),
			E('div', { 'class': 'kanno-grid' }, [
				this.kernelCard('M', 'blue', 'mihomo', mihomo.version, mihomo.installed, 'mihomo',
					mihomo.installed ? _('installed') : _('not installed')),
				this.kernelCard('S', 'red', 'sing-box', singbox.version, singbox.installed, 'singbox',
					singbox.installed ? _('installed') : _('not installed')),
				this.kernelCard('G', 'green', 'GeoData', geo.version, geoOk, 'geodata',
					geoOk ? _('GeoIP + GeoSite') : _('missing data'))
			])
		]);
	},

	handleSaveGlobal: function () {
		var payload = {
			kernel: document.getElementById('k-kernel').value,
			mode: document.getElementById('k-mode').value,
			log_level: document.getElementById('k-log').value
		};
		return api.call('save_global', payload).then(function (r) {
			if (r && r.ok)
				ui.addTimeLimitedNotification(null, E('p', _('Settings saved — restart to apply')), 3500, 'success');
			else
				ui.addNotification(null, E('p', _('Save failed')), 'danger');
		}).catch(function (e) {
			ui.addNotification(null, E('p', _('Save failed: ') + e.message), 'danger');
		});
	},

	handleUpdate: function (target) {
		return api.call('update_kernel', { target: target }).then(function (r) {
			ui.addTimeLimitedNotification(null,
				E('p', (r && r.message) || _('Update started in background — check the Logs tab')),
				5000, 'info');
		}).catch(function (e) {
			ui.addNotification(null, E('p', _('Update failed: ') + e.message), 'danger');
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
