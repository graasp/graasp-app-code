// example sanitize function
const sanitize = code => {
  return code;
};

// example run function
const runPython = (code = '') => {
  const sanitizedCode = sanitize(code);
  return `Python: ${sanitizedCode.length}`;
};

export { sanitize, runPython };
