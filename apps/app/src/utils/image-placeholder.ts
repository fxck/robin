/**
 * Image placeholder utilities
 * Generates beautiful gradient placeholders and fallback images
 */

/**
 * Seeded random number generator for consistent randomness
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Generate abstract blurry bubble placeholder for non-existing images
 * Creates random dark pastel colored bubbles with extreme blur
 */
export function generateAbstractBubblePlaceholder(seed = '', aspectRatio = 16/9): string {
  const random = seededRandom(seed);

  // Dark pastel color palette
  const darkPastelColors = [
    '#4a5568', '#5a4a68', '#684a5a', '#68594a',
    '#4a6857', '#4a5f68', '#5d4a68', '#684a4a',
    '#3d5a5f', '#5f3d5a', '#5a5f3d', '#3d4a5f',
    '#5f4a3d', '#4a3d5f', '#3d5f4a', '#5f5a3d'
  ];

  const width = 100;
  const height = Math.round(width / aspectRatio);

  // Generate 8-12 random bubbles
  const bubbleCount = Math.floor(random() * 5) + 8;
  const bubbles: string[] = [];

  for (let i = 0; i < bubbleCount; i++) {
    const cx = random() * 100;
    const cy = random() * 100;
    const r = random() * 40 + 20; // Radius between 20-60
    const color = darkPastelColors[Math.floor(random() * darkPastelColors.length)];
    const opacity = random() * 0.4 + 0.3; // Opacity between 0.3-0.7

    bubbles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 100 ${100 / aspectRatio}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15"/>
        </filter>
      </defs>
      <rect width="100" height="${100 / aspectRatio}" fill="#1a1a1a"/>
      <g filter="url(#blur)">
        ${bubbles.join('\n        ')}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate a tiny blurred thumbnail placeholder (LQIP - Low Quality Image Placeholder)
 * This creates a 100x100px blurred version for the blur-up effect
 */
export function generateTinyBlurPlaceholder(seed = '', aspectRatio = 16/9): string {
  const random = seededRandom(seed);

  // Dark pastel colors for a more sophisticated look
  const colors = [
    '#4a5568', '#5a4a68', '#684a5a', '#68594a',
    '#4a6857', '#4a5f68', '#5d4a68', '#684a4a',
    '#3d5a5f', '#5f3d5a', '#5a5f3d', '#3d4a5f',
    '#5f4a3d', '#4a3d5f', '#3d5f4a', '#5f5a3d'
  ];

  const width = 100;
  const height = Math.round(width / aspectRatio);

  // Create a gradient with 3-4 color stops
  const stopCount = Math.floor(random() * 2) + 3;
  const stops: string[] = [];

  for (let i = 0; i < stopCount; i++) {
    const offset = (i / (stopCount - 1)) * 100;
    const color = colors[Math.floor(random() * colors.length)];
    stops.push(`<stop offset="${offset}%" style="stop-color:${color};stop-opacity:1" />`);
  }

  // Random gradient angle
  const angle = random() * 360;
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 + Math.cos(rad) * 50;
  const y1 = 50 + Math.sin(rad) * 50;
  const x2 = 50 - Math.cos(rad) * 50;
  const y2 = 50 - Math.sin(rad) * 50;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
          ${stops.join('\n          ')}
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" filter="url(#blur)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate a gradient placeholder based on a seed (like user ID or post ID)
 */
export function generateGradientPlaceholder(seed = ''): string {
  const colors = [
    ['#667eea', '#764ba2'], // Purple
    ['#f093fb', '#f5576c'], // Pink
    ['#4facfe', '#00f2fe'], // Blue
    ['#43e97b', '#38f9d7'], // Green
    ['#fa709a', '#fee140'], // Sunset
    ['#30cfd0', '#330867'], // Ocean
    ['#a8edea', '#fed6e3'], // Pastel
    ['#ff9a56', '#ff6a88'], // Orange-Pink
    ['#ffecd2', '#fcb69f'], // Peach
    ['#ff6e7f', '#bfe9ff'], // Red-Blue
    ['#21d4fd', '#b721ff'], // Cyan-Purple
    ['#08aeea', '#2af598'], // Blue-Green
  ];

  // Simple hash function to get consistent color pair
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % colors.length;
  const [color1, color2] = colors[index];

  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

/**
 * Generate an SVG placeholder with initials
 */
export function generateInitialsPlaceholder(
  text: string,
  size = 200
): string {
  const initials = text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const gradient = generateGradientPlaceholder(text);
  const [, color1, color2] = gradient.match(/linear-gradient\(.+?, (.+?) 0%, (.+?) 100%\)/) || [];

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${size * 0.4}"
        font-weight="600"
        fill="white"
      >${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate a placeholder with an icon
 */
export function generateIconPlaceholder(
  icon: 'image' | 'user' | 'file' = 'image',
  size = 200
): string {
  const gradient = generateGradientPlaceholder(icon);
  const [, color1, color2] = gradient.match(/linear-gradient\(.+?, (.+?) 0%, (.+?) 100%\)/) || [];

  const iconPaths = {
    image: `<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="white" stroke-width="2" fill="none"/>`,
    user: `<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="white"/>`,
    file: `<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="white" stroke-width="2" fill="none"/>`,
  };

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" fill="url(#grad)"/>
      ${iconPaths[icon]}
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get placeholder blur data URL for skeleton loading
 */
export function getSkeletonPlaceholder(aspectRatio: number = 16 / 9): string {
  const width = 40;
  const height = Math.round(width / aspectRatio);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
