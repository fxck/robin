import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { FileUpload } from './file-upload';
import { toast } from 'sonner';

/**
 * Example component showing how to use FileUpload with TanStack Form
 *
 * This demonstrates:
 * - Integration with TanStack Form
 * - Zod validation for image URLs
 * - Proper form submission
 */

// Zod validator for image URL
const imageUrlValidator = z
  .string()
  .url({ message: 'Please upload an image' })
  .optional()
  .or(z.literal(''));

interface FormData {
  title: string;
  imageUrl: string;
}

export function FileUploadExample() {
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      imageUrl: '',
    },
    onSubmit: async ({ value }) => {
      // Your form submission logic here
      console.log('Form submitted:', value);
      toast.success('Form submitted successfully!');
    },
  });

  return (
    <Card size="3" style={{ maxWidth: '600px' }}>
      <Flex direction="column" gap="4">
        <Text size="6" weight="bold">
          File Upload Example
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Flex direction="column" gap="4">
            {/* Title field */}
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 3) {
                    return 'Title must be at least 3 characters';
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors[0];
                return (
                  <div>
                    <Text size="2" weight="medium" mb="2">
                      Title
                    </Text>
                    <TextField.Root
                      placeholder="Enter a title"
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

            {/* Image upload field */}
            <form.Field
              name="imageUrl"
              validators={{
                onChange: ({ value }) => {
                  const result = imageUrlValidator.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors[0];
                return (
                  <div>
                    <Text size="2" weight="medium" mb="2">
                      Cover Image
                    </Text>
                    <FileUpload
                      value={field.state.value}
                      onChange={(url) => field.handleChange(url)}
                      onError={(error) => {
                        console.error('Upload error:', error);
                      }}
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

            {/* Submit button */}
            <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
              {([isSubmitting, canSubmit]) => (
                <Button
                  type="submit"
                  size="3"
                  disabled={isSubmitting || !canSubmit}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </form.Subscribe>
          </Flex>
        </form>
      </Flex>
    </Card>
  );
}
