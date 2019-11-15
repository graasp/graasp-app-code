// source: http://bit.ly/2ZwRI5k
export default function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
