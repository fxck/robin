import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button, Flex, Text, TextField, Separator } from '@radix-ui/themes';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { signIn, signUp } from '../lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';

// Individual field validators
const nameValidator = z.string().min(2, { message: 'Name must be at least 2 characters' });
const emailValidator = z.string().email({ message: 'Invalid email address' });
const passwordSignUpValidator = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Must contain uppercase letter' })
  .regex(/[0-9]/, { message: 'Must contain a number' });
const passwordSignInValidator = z.string().min(1, { message: 'Password is required' });

type AuthMode = 'signin' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const isSignUp = mode === 'signup';

  // Fetch enabled providers
  const { data: providersData } = useQuery({
    queryKey: ['auth-providers'],
    queryFn: () => api.get<{ providers: { email: boolean; github: boolean; google: boolean } }>('/api/auth/providers'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const providers = providersData?.providers || { email: true, github: false, google: false };
  const hasSocialProviders = providers.github || providers.google;

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (isSignUp) {
          const result = await signUp.email({
            email: value.email,
            password: value.password,
            name: value.name,
          });

          if (result.error) {
            throw new Error(result.error.message || 'Sign up failed');
          }

          toast.success('Account created successfully!');
        } else {
          const result = await signIn.email({
            email: value.email,
            password: value.password,
          });

          if (result.error) {
            throw new Error(result.error.message || 'Sign in failed');
          }

          toast.success('Signed in successfully!');
        }

        onSuccess?.();
      } catch (error) {
        // Handle specific error cases
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

        if (errorMessage.includes('already exists')) {
          toast.error('An account with this email already exists');
        } else if (errorMessage.includes('Invalid') || errorMessage.includes('incorrect')) {
          toast.error('Invalid email or password');
        } else if (errorMessage.includes('rate limit')) {
          toast.error('Too many attempts. Please try again later.');
        } else {
          toast.error(errorMessage);
        }
      }
    },
  });

  return (
    <div className="w-full max-w-md glass-surface p-8 animate-fade-in">
      <Flex direction="column" gap="5">
        {/* Social Auth Buttons - Only show if providers are enabled */}
        {hasSocialProviders && (
          <>
            <Flex direction="column" gap="3">
              {providers.github && (
                <Button
                  type="button"
                  variant="outline"
                  size="3"
                  className="w-full hover:bg-white/5 transition-colors"
                  onClick={async () => {
                    try {
                      await signIn.social({
                        provider: 'github',
                        callbackURL: '/dashboard',
                      });
                    } catch (error) {
                      toast.error('GitHub sign in failed');
                    }
                  }}
                >
                  <Flex align="center" gap="2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </Flex>
                </Button>
              )}

              {providers.google && (
                <Button
                  type="button"
                  variant="outline"
                  size="3"
                  className="w-full hover:bg-white/5 transition-colors"
                  onClick={async () => {
                    try {
                      await signIn.social({
                        provider: 'google',
                        callbackURL: '/dashboard',
                      });
                    } catch (error) {
                      toast.error('Google sign in failed');
                    }
                  }}
                >
                  <Flex align="center" gap="2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </Flex>
                </Button>
              )}
            </Flex>

            <Flex align="center" gap="3">
              <Separator size="4" style={{ flexGrow: 1 }} />
              <Text size="2" color="gray">or</Text>
              <Separator size="4" style={{ flexGrow: 1 }} />
            </Flex>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Flex direction="column" gap="3">
            {isSignUp && (
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const result = nameValidator.safeParse(value);
                    return result.success ? undefined : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => {
                  const errorMessage = field.state.meta.errors[0];
                  return (
                    <div>
                      <TextField.Root
                        placeholder="Full Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {errorMessage && (
                        <Text size="1" color="red" mt="1">
                          {errorMessage}
                        </Text>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            )}

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = emailValidator.safeParse(value);
                  return result.success ? undefined : 'Invalid email address';
                },
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors[0];
                return (
                  <div>
                    <TextField.Root
                      type="email"
                      placeholder="Email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {errorMessage && (
                      <Text size="1" color="red" mt="1">
                        {errorMessage}
                      </Text>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const validator = isSignUp ? passwordSignUpValidator : passwordSignInValidator;
                  const result = validator.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors[0];
                return (
                  <div>
                    <TextField.Root
                      type="password"
                      placeholder="Password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {errorMessage && (
                      <Text size="1" color="red" mt="1">
                        {errorMessage}
                      </Text>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  size="3"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all shadow-accent"
                >
                  {isSubmitting
                    ? 'Loading...'
                    : isSignUp
                    ? 'Sign Up'
                    : 'Sign In'}
                </Button>
              )}
            </form.Subscribe>
          </Flex>
        </form>

        {!isSignUp && (
          <Flex justify="end">
            <Link to="/forgot-password">
              <Text size="2" className="cursor-pointer text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Text>
            </Link>
          </Flex>
        )}

        {onToggleMode && (
          <Flex justify="center" align="center" gap="2" className="pt-4 border-t border-white/10">
            <Text size="2" color="gray">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <button
              type="button"
              onClick={onToggleMode}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </Flex>
        )}
      </Flex>
    </div>
  );
}
