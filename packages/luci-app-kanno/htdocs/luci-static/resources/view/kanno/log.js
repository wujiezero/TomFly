'use strict';
'require view';
'require ui';
'require poll';
'require kanno.api as api';

document.querySelector('head').appendChild(E('link', {
	'rel': 'stylesheet', 'type': 'text/css',
	'href': L.resource('view/kanno/style.css')
}));

function notify(content, ms) {
	var el = ui.addNotification(null, content);
	if (ms > 0) window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
}

return view.extend({
	load: function () {
		return L.resolveDefault(api.call('get_logs', { lines: 200 }), { lines: [] });
	},

	render: function (r) {
		var lines = (r && r.lines) || [];
		var box = E('pre', { 'class': 'kanno-log', 'id': 'kanno-log' }, lines.join('\n') || _('(no log output)'));

		poll.add(function () {
			return L.resolveDefault(api.call('get_logs', { lines: 200 }), { lines: [] }).then(function (r) {
				var el = document.getElementById('kanno-log');
				if (el) {
					var atBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 40;
					el.textContent = ((r && r.lines) || []).join('\n') || _('(no log output)');
					if (atBottom) el.scrollTop = el.scrollHeight;
				}
			});
		}, 5);

		return E('div', { 'class': 'kanno' }, [
			E('div', { 'class': 'kanno-row', 'style': 'margin-bottom:10px' }, [
				E('h3', { 'style': 'margin:0' }, _('Service Log')),
				E('button', {
					'class': 'cbi-button cbi-button-remove',
					'click': ui.createHandlerFn(this, 'handleClear')
				}, _('Clear Log'))
			]),
			E('div', { 'class': 'kanno-card', 'style': 'padding:0;overflow:hidden' }, [box])
		]);
	},

	handleClear: function () {
		return api.call('clear_log').then(function () {
			var el = document.getElementById('kanno-log');
			if (el) el.textContent = '';
			notify(E('p', _('Log cleared')), 2000);
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
