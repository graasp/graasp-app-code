// todo: implement
const sanitize = code => {
  return code;
};

const runPython = (config, callback) => {
  const { headerCode, footerCode, code, worker, fs } = config;

  worker.onTerminated = callback;

  // send all files in the fs to the worker
  Object.keys(fs).forEach(path => {
    worker.putFile(path, fs[path] && fs[path].content);
  });

  // concatenate code
  const fullCode = `${headerCode}\n${code}\n${footerCode}`;

  worker.run(fullCode);
};

export { sanitize, runPython };
