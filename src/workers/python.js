export default encodeURIComponent(`
  importScripts("https://graasp-pyodide.s3.amazonaws.com/Pyodide.js", "https://graasp-pyodide.s3.amazonaws.com/v0.14.1/pyodide.js");
  
  var loaded = false;
  
  let outputClear = false;
  let outputBuffer = "";
  let pendingOutputFlushTime = -1;
  const outputUpdateRate = 10;      // ms
  
  const options = {
    write: (str) => {
      outputBuffer += str;
    },
    clearText: () => {
      outputBuffer = "";
      outputClear = true;
    },
    setFigureURL: (dataURL) => {
      postMessage({cmd: "figure", data: dataURL});
    },
    ready: () => {
      updateOutput(true);
      postMessage({cmd: "done"});
    },
    notifyDirtyFile: (path) => {
      postMessage({cmd: "dirty", data: path});
    },
    handleInput: true
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
        postMessage({cmd: "clear"});
        outputClear = false;
      }
      if (outputBuffer) {
        postMessage({cmd: "print", data: outputBuffer});
        outputBuffer = "";
      }
      pendingOutputFlushTime = -1;
    }
  }
  
  function sendCommand(cmd, data) {
    postMessage({cmd: "cmd:" + cmd, data: data})
  }
  
  function run(src) {
    if (src) {
      p.run(src);
      if (p.requestInput) {
        postMessage({cmd: "input", prompt: p.inputPrompt});
      }
    } else {
      postMessage({cmd: "done"});
    }
  }
  
  function submitInput(str) {
    p.submitInput(str);
    if (p.requestInput) {
      postMessage({cmd: "input", prompt: p.inputPrompt});
    }
  }
  
  onmessage = (ev) => {
    console.log(ev); // todo: remove
    let msg = JSON.parse(ev.data);
    switch (msg.cmd) {
    case "run":
      if (loaded) {
        run(msg.code);
      } else {
        p.load(() => {
          run(msg.code || "");
          loaded = true;
        });
      }
      break;
    case "submit":
      submitInput(msg.str);
      break;
    case "get":
      postMessage({cmd: "file", path: msg.path, data: p.fs.getFile(msg.path)});
      break;
    case "put":
      p.fs.setFile(msg.path, msg.data);
      break;
    case "clearFigure":
      p.clearFigure();
      break;
    }
  };
`);
