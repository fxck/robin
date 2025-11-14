import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { signIn, signUp } from '../lib/auth';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AuthMode = 'signin' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const isSignUp = mode === 'signup';

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: isSignUp ? signUpSchema : signInSchema,
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
    <Card size="3" style={{ maxWidth: '400px' }}>
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Flex direction="column" gap="3">
            {isSignUp && (
              <form.Field name="name">
                {(field) => {
                  const error = field.state.meta.errors[0];
                  const errorMessage = typeof error === 'string' ? error : error?.message || 'Invalid value';
                  return (
                    <div>
                      <TextField.Root
                        placeholder="Full Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text size="1" color="red" mt="1">
                          {errorMessage}
                        </Text>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            )}

            <form.Field name="email">
              {(field) => {
                const error = field.state.meta.errors[0];
                const errorMessage = typeof error === 'string' ? error : error?.message || 'Invalid value';
                return (
                  <div>
                    <TextField.Root
                      type="email"
                      placeholder="Email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text size="1" color="red" mt="1">
                        {errorMessage}
                      </Text>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const error = field.state.meta.errors[0];
                const errorMessage = typeof error === 'string' ? error : error?.message || 'Invalid value';
                return (
                  <div>
                    <TextField.Root
                      type="password"
                      placeholder="Password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
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
                  style={{ width: '100%' }}
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
              <Text size="2" style={{ cursor: 'pointer', color: 'var(--accent-11)' }}>
                Forgot password?
              </Text>
            </Link>
          </Flex>
        )}

        {onToggleMode && (
          <Text size="2" align="center">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="ghost" onClick={onToggleMode}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </Text>
        )}
      </Flex>
    </Card>
  );
}
