export default defineEventHandler(async () => {
  return {
    providers: {
      email: true,
      github: !!process.env['GITHUB_CLIENT_ID'],
      google: !!process.env['GOOGLE_CLIENT_ID'],
    },
  };
});
