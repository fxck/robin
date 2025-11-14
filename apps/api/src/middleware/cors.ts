export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const origin = event.node.req.headers.origin || '';

  // In development, allow any localhost port. In production, use strict whitelist.
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const localhostPattern = /^http:\/\/localhost:\d+$/;

  const isAllowed = isDevelopment
    ? localhostPattern.test(origin) || origin === config.public.appUrl
    : origin === config.public.appUrl;

  if (isAllowed) {
    event.node.res.setHeader('Access-Control-Allow-Origin', origin);
    event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    event.node.res.setHeader('Access-Control-Allow-Credentials', 'true');
    event.node.res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
  // Don't return anything to let the request continue
});
