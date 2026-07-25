const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Fi = require('react-icons/fi');

const OUT = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// name -> [IconComponent, hexColor]
const jobs = {
  target: [Fi.FiTarget, '22C55E'],
  mapPin: [Fi.FiMapPin, '22C55E'],
  shield: [Fi.FiShield, '22C55E'],
  sliders: [Fi.FiSliders, '22C55E'],
  video: [Fi.FiVideo, 'F0FDF4'],
  image: [Fi.FiImage, 'F0FDF4'],
  play: [Fi.FiPlayCircle, 'F0FDF4'],
  checkSquare: [Fi.FiCheckSquare, '16A34A'],
  layers: [Fi.FiLayers, '22C55E'],
  compass: [Fi.FiCompass, '22C55E'],
  trendingUp: [Fi.FiTrendingUp, '22C55E'],
  users: [Fi.FiUsers, '22C55E'],
  clock: [Fi.FiClock, '22C55E'],
  checkCircle: [Fi.FiCheckCircle, '16A34A'],
  alertTriangle: [Fi.FiAlertTriangle, 'D97706'],
  award: [Fi.FiAward, '22C55E'],
  monitor: [Fi.FiMonitor, '22C55E'],
};

async function run() {
  for (const [name, [Icon, color]] of Object.entries(jobs)) {
    // Keep react-icons' own <svg> root verbatim (it already carries the
    // correct fill="none"/stroke="currentColor" attributes) - rebuilding the
    // wrapper tag drops those and every unfilled path defaults to solid
    // black fill instead of inheriting "none".
    let svg = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Icon, { size: 256, color: `#${color}`, strokeWidth: 1.6 })
    );
    if (!svg.includes('xmlns=')) {
      svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
    const outPath = path.join(OUT, `${name}.png`);
    await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(outPath);
    console.log('wrote', outPath);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
