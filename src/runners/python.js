// todo: implement
const sanitize = code => {
  return code;
};

const runPython = (config, callback) => {
  const { headerCode, footerCode, code, worker } = config;

  worker.onTerminated = callback;

  // concatenate code
  const fullCode = `${headerCode}\n${code}\n${footerCode}`;

  worker.run(fullCode);
};

export { sanitize, runPython };
