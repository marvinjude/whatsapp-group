export function prettyDate(time) {
  var date = new Date(parseInt(time));
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function setHeightProperty() {
  let vh = window.innerHeight * 0.01;

  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
export function generateRandomColor() {
  const R = Math.round((Math.random() * 1000) % 255);
  const G = Math.round((Math.random() * 1000) % 255);
  const B = Math.round((Math.random() * 1000) % 255);
  return `rgb(${R}, ${G}, ${B})`;
}
