const origin = location.origin;
const links = {
  dunamis: `${origin}/dunamis`,
  zoe: `${origin}/zoe`,
  pneuma: `${origin}/pneuma`,
  admin: `${origin}/admin`,
  display: `${origin}/display`,
  timer: `${origin}/timer`,
  "timer-control": `${origin}/timer-control`,
  host: `${origin}/host`,
  scores: `${origin}/scores`,
};

for (const [key, url] of Object.entries(links)) {
  const node = document.querySelector(`[data-link="${key}"]`);
  if (node) node.textContent = url;
  const anchor = document.querySelector(`[data-href="${key}"]`);
  if (anchor) anchor.href = url;
}
