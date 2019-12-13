// todo: implement
const sanitize = code => {
  return code;
};

const runPython = config => {
  const { headerCode, footerCode, code, worker } = config;

  // concatenate code
  const fullCode = `${headerCode}\n${code}\n${footerCode}`;
  worker.run(fullCode);
};

export { sanitize, runPython };
