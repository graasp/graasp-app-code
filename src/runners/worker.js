export default encodeURIComponent(`
onmessage = function (ev) {
	function print(val) {
		postMessage({cmd: "print", data: val.toString()});
	}
	function println(val) {
		postMessage({cmd: "print", data: (val ? val.toString() : "") + "\\n"});
	}
	function clear() {
		postMessage({cmd: "clear"});
	}

	const f = new Function("print", "println", "clear", ev.data);
	f(print, println, clear);
};
`);
