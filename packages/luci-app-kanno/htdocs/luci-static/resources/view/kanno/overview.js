'use strict';
'require view';
'require ui';
'require poll';
'require dom';
'require kanno.api as api';

document.querySelector('head').appendChild(E('link', {
	'rel': 'stylesheet', 'type': 'text/css',
	'href': L.resource('view/kanno/style.css')
}));

function svg(paths) {
	var s = E('span');
	s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
		'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">' +
		paths + '</svg>';
	return s.firstChild;
}

var ICON = {
	cpu:  '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
	node: '<circle cx="12" cy="5" r="2"/><path d="M12 7v10"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 17v-1a6 6 0 0 1 12 0v1"/>',
	link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
	mode: '<path d="M3 6h18M3 12h18M3 18h18"/>'
};

return view.extend({
	load: function () {
		return Promise.all([
			L.resolveDefault(api.call('get_status'), {}),
			L.resolveDefault(api.call('get_nodes'), { nodes: [] })
		]);
	},

	statusInner: function (s) {
		s = s || {};
		var running = !!s.running;
		return [
			E('span', { 'class': 'kanno-pill ' + (running ? 'kanno-pill-on' : 'kanno-pill-off') }, [
				E('span', { 'class': 'kanno-dot' }), running ? _('Running') : _('Stopped')
			]),
			E('div', { 'class': 'kanno-actions' }, [
				E('button', {
					'class': 'cbi-button cbi-button-save important',
					'click': ui.createHandlerFn(this, 'handleAction', 'restart')
				}, running ? _('Restart') : _('Start')),
				running ? E('button', {
					'class': 'cbi-button cbi-button-remove important',
					'click': ui.createHandlerFn(this, 'handleAction', 'stop')
				}, _('Stop')) : ''
			])
		];
	},

	stat: function (color, iconKey, value, label, id) {
		return E('div', { 'class': 'kanno-card kanno-stat' }, [
			E('div', { 'class': 'kanno-stat-icon kanno-ic-' + color }, svg(ICON[iconKey])),
			E('div', {}, [
				E('div', { 'class': 'kanno-stat-value', 'id': id || null }, value),
				E('div', { 'class': 'kanno-stat-label' }, label)
			])
		]);
	},

	render: function (data) {
		var s = data[0] || {}, nodes = (data[1] || {}).nodes || [];

		var statusCard = E('div', { 'class': 'kanno-card' }, [
			E('div', { 'class': 'kanno-card-title' }, _('Service Status')),
			E('div', { 'id': 'kanno-status', 'class': 'kanno-row' }, this.statusInner(s))
		]);

		var grid = E('div', { 'class': 'kanno-grid' }, [
			this.stat('blue',   'cpu',  s.kernel || 'mihomo',          _('Kernel')),
			this.stat('indigo', 'node', String(nodes.length),          _('Nodes')),
			this.stat('amber',  'link', String(s.connections || 0),    _('Connections'), 'kanno-conns'),
			this.stat('green',  'mode', s.mode || 'rule',              _('Mode'))
		]);

		var quick = E('div', { 'class': 'kanno-card' }, [
			E('div', { 'class': 'kanno-card-title' }, _('Quick Add Node')),
			E('div', { 'class': 'kanno-row' }, [
				E('input', {
					'class': 'cbi-input-text', 'id': 'kanno-quick', 'type': 'text',
					'style': 'flex:1;min-width:240px',
					'placeholder': 'vless:// vmess:// trojan:// ss:// hy2:// tuic://',
					'keydown': ui.createHandlerFn(this, function (ev) {
						if (ev.keyCode === 13) return this.handleQuickAdd(ev);
					})
				}),
				E('button', {
					'class': 'cbi-button cbi-button-action important',
					'click': ui.createHandlerFn(this, 'handleQuickAdd')
				}, _('Add'))
			])
		]);

		var version = s.version ? E('div', { 'class': 'kanno-card' }, [
			E('div', { 'class': 'kanno-card-title' }, _('Version')),
			E('code', { 'class': 'kanno-muted' }, s.version)
		]) : '';

		poll.add(L.bind(function () {
			return L.resolveDefault(api.call('get_status'), {}).then(L.bind(function (st) {
				var el = document.getElementById('kanno-status');
				if (el) dom.content(el, this.statusInner(st));
				var c = document.getElementById('kanno-conns');
				if (c) c.textContent = String(st.connections || 0);
			}, this));
		}, this), 5);

		return E('div', { 'class': 'kanno' }, [statusCard, grid, quick, version]);
	},

	handleAction: function (act) {
		var self = this;
		return api.call(act).then(function () {
			ui.addTimeLimitedNotification(null,
				E('p', act === 'stop' ? _('Service stopped') : _('Service is (re)starting…')),
				3000, 'success');
			return new Promise(function (res) { window.setTimeout(res, act === 'stop' ? 1500 : 2500); });
		}).then(function () {
			return L.resolveDefault(api.call('get_status'), {});
		}).then(function (st) {
			var el = document.getElementById('kanno-status');
			if (el) dom.content(el, self.statusInner(st));
		});
	},

	handleQuickAdd: function () {
		var inp = document.getElementById('kanno-quick');
		var uri = (inp && inp.value || '').trim();
		if (!uri) return;
		return api.call('add_node', { uri: uri }).then(function (r) {
			if (r && r.ok) {
				ui.addTimeLimitedNotification(null,
					E('p', _('Node added: ') + (r.name || uri)), 3000, 'success');
				if (inp) inp.value = '';
			} else {
				ui.addNotification(null, E('p', _('Add failed: ') + ((r && r.error) || _('parse error'))), 'danger');
			}
		}).catch(function (e) {
			ui.addNotification(null, E('p', _('Add failed: ') + e.message), 'danger');
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
