export default encodeURIComponent(`
  importScripts(
    'https://graasp-pyodide.s3.amazonaws.com/v0.1.0/Pyodide.js',
    'https://graasp-pyodide.s3.amazonaws.com/lib/v0.14.1/pyodide.js'
  );

  var loaded = false;
  
  let outputClear = false;
  let outputBuffer = '';
  let pendingOutputFlushTime = -1;
  const outputUpdateRate = 10;  // ms
  
  const options = {
    write: (str) => {
      outputBuffer += str;
    },
    clearText: () => {
      outputBuffer = '';
      outputClear = true;
    },
    setFigureURL: (dataURL) => {
      postMessage({ cmd: 'figure', data: dataURL });
    },
    notifyStatus: (status) => {
      postMessage({ cmd: 'status', status: status });
    },
    notifyDirtyFile: (path) => {
      postMessage({ cmd: 'dirty', data: path });
    },
    postExec: function () {
      updateOutput(true);
      postMessage({ cmd: 'done' });
      if (p.requestInput) {
        postMessage({ cmd: 'input', prompt: p.inputPrompt });
      }
    },
    handleInput: true,
  };
  const p = new Pyodide(options);
  
  function updateOutput(forced) {
    let currentTime = Date.now();
    if (forced) {
      pendingOutputFlushTime = currentTime;
    }
    if (pendingOutputFlushTime < 0) {
      // schedule flush
      pendingOutputFlushTime = currentTime + outputUpdateRate;
    } else if (pendingOutputFlushTime <= currentTime) {
      // time to flush
      if (outputClear) {
        postMessage({ cmd: 'clear' });
        outputClear = false;
      }
      if (outputBuffer) {
        postMessage({ cmd: 'print', data: outputBuffer });
        outputBuffer = '';
      }
      pendingOutputFlushTime = -1;
    }
  }
  
  function sendCommand(cmd, data) {
    postMessage({ cmd: 'cmd:' + cmd, data: data });
  }
  
  function run(src) {
    postMessage({ cmd: 'status', status: 'running' });
    p.run(src);
  }
  
  function submitInput(str) {
    p.submitInput(str);
  }
  
  function cancelInput(str) {
    p.cancelInput();
  }
  
  onmessage = (ev) => {
    let msg = JSON.parse(ev.data);
    switch (msg.cmd) {
      case 'preload':
        postMessage({ cmd: 'status', status: 'startup' });
        p.load(() => {
          loaded = true;
          postMessage({ cmd: 'done' });
        });
        break;
      case 'run':
        if (loaded) {
          run(msg.code);
        } else {
          postMessage({ cmd: 'status', status: 'startup' });
          p.load(() => {
            run(msg.code);
            loaded = true;
          });
        }
        break;
      case 'submit':
        submitInput(msg.str);
        break;
      case 'cancel':
        cancelInput();
        break;
      case 'get':
        postMessage(
          { cmd: 'file', path: msg.path, data: p.fs.getFile(msg.path) });
        break;
      case 'put':
        p.fs.setFile(msg.path, msg.data);
        break;
      case 'clearFigure':
        p.clearFigure();
        break;
    }
  };
`);
