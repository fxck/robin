export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  return {
    baseURL: config.public.apiBase,
    appURL: config.public.appUrl,
    googleRedirectUri: `${config.public.apiBase}/api/auth/callback/google`,
    githubRedirectUri: `${config.public.apiBase}/api/auth/callback/github`,
    hasGoogleCredentials: !!process.env['GOOGLE_CLIENT_ID'],
    hasGithubCredentials: !!process.env['GITHUB_CLIENT_ID'],
  };
});
