'use strict';
'require view';
'require poll';
'require kanno.api as api';

document.querySelector('head').appendChild(E('link', {
	'rel': 'stylesheet', 'type': 'text/css',
	'href': L.resource('view/kanno/style.css')
}));

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
			E('div', { 'class': 'kanno-card', 'style': 'padding:0;overflow:hidden' }, [box])
		]);
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
