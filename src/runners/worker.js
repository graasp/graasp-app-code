export default encodeURIComponent(`
onmessage = function (ev) {
	const { command, data } = ev.data;

	switch(command) {
		case 'SET_INPUT':
			__STDIN_FIFO__ = Array.from(data);
			break;
		case 'SEND_INPUT':
		case 'APPEND_INPUT':
			if (__STDIN_FIFO__) {
				__STDIN_FIFO__.push(data);
			} else {
				__STDIN_FIFO__ = Array.from(data);
			}
			break;
		case 'RUN_CODE':
		default:
			function print(val) {
				postMessage({cmd: "print", data: val.toString()});
			}
			function printLine(val) {
				postMessage({cmd: "print", data: String(value) + "\\n"});
			}
			function clear() {
				postMessage({cmd: "clear"});
			}

			function read(){
				const val = __STDIN_FIFO__ ? __STDIN_FIFO__.shift() : undefined;

				return val;
			}

			function readLine(){
				const eol = '\\n';

				if(!__STDIN_FIFO__) {
					return undefined;
				}

				if(__STDIN_FIFO__.length == 0) {
					return undefined;
				}

				const index = __STDIN_FIFO__.indexOf(eol);
				if(index < 0) {
					val = readAll();
				} else {
					val = '';
					while((c = read()) != eol){
						val += c;
					}
				}

				return val;
			}

			function readAll(){
				const val = __STDIN_FIFO__.join('');
				__STDIN_FIFO__ = [];

				return val;
			}

			const f = new Function("print", "printLine", "clear", "read", "readLine", "readAll", data);
			f(print, printLine, clear, read, readLine, readAll);
	}
};
`);
