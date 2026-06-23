'use strict';
'require baseclass';

/* Logo sizing lives here so a stale style.css cannot leave a 1024px image uncapped. */
(function () {
	var id = 'tomfly-logo-css';
	if (document.getElementById(id))
		return;
	document.head.appendChild(E('style', { 'id': id }, [
		'.tomfly { position: relative; }',
		'.tomfly-logo-corner {',
		'  position: absolute; top: 0; right: 0;',
		'  width: 100px; height: 100px;',
		'  max-width: 100px; max-height: 100px;',
		'  background: center / contain no-repeat;',
		'  pointer-events: none; opacity: .85; z-index: 2;',
		'  overflow: hidden;',
		'}'
	].join('\n')));
})();

var LOGO_URL = L.resource('view/tomfly/logo.png');
var LOGO_BOX = [
	'position:absolute',
	'top:0',
	'right:0',
	'width:100px',
	'height:100px',
	'max-width:100px',
	'max-height:100px',
	'background:url("' + LOGO_URL + '") center/contain no-repeat',
	'pointer-events:none',
	'opacity:.85',
	'z-index:2',
	'overflow:hidden'
].join(';');

return baseclass.extend({
	logo: function () {
		return E('div', {
			'class': 'tomfly-logo-corner',
			'title': 'TomFly',
			'style': LOGO_BOX
		});
	},

	page: function (pageTitle, children) {
		var nodes = Array.isArray(children) ? children : [children];
		return E('div', { 'class': 'tomfly' }, [this.logo()].concat(nodes));
	}
});
