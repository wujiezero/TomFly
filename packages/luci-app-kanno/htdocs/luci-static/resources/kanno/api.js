'use strict';
'require baseclass';

/*
 * Shared client for the KannoProxy backend.
 *
 * All views call api.call('<method>', {params}) which POSTs to the CGI
 * endpoint at /cgi-bin/kanno. That CGI proxies to the luci.rpc.kanno Lua
 * module and returns either:
 *     { "ok": true,  "result": <method return value> }
 *     { "ok": false, "error":  "<message>" }
 *
 * call() rejects on transport/backend errors and otherwise resolves with the
 * inner `result`. Note that several backend methods themselves return
 * { ok: true/false, ... } — callers should inspect result.ok for those.
 */
return baseclass.extend({
	call: function (method, params) {
		return fetch('/cgi-bin/kanno', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ method: method, params: params || {} }),
			credentials: 'include'
		}).then(function (r) {
			if (!r.ok)
				throw new Error('HTTP ' + r.status);
			return r.json();
		}).then(function (j) {
			if (!j || !j.ok)
				throw new Error((j && j.error) || 'backend error');
			return j.result;
		});
	}
});
