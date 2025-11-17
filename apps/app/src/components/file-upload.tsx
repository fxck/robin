import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Card, Flex, Text } from '@radix-ui/themes';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Image } from './image';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FileUploadProps {
  /** Current file URL (for editing existing files) */
  value?: string;
  /** Callback when file is uploaded successfully */
  onChange?: (url: string) => void;
  /** Callback when upload fails */
  onError?: (error: Error) => void;
  /** Maximum file size in bytes (default: 10MB to match API limit) */
  maxSize?: number;
  /** Accepted file types (default: images only) */
  accept?: Record<string, string[]>;
  /** Whether upload is disabled */
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  onError,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Clear previous errors
      setUploadError(undefined);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        let errorMessage = 'File upload failed';

        if (rejection.errors?.[0]?.code === 'file-too-large') {
          errorMessage = `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
        } else if (rejection.errors?.[0]?.code === 'file-invalid-type') {
          errorMessage = 'Invalid file type. Please upload an image.';
        } else {
          errorMessage = rejection.errors?.[0]?.message || 'File upload failed';
        }

        setUploadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Handle accepted file
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      try {
        setIsUploading(true);

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          // Don't set Content-Type - browser will set it with boundary
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();

        // Update with actual URL
        setPreview(data.url);
        onChange?.(data.url);
        toast.success('File uploaded successfully!');

        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadError(errorMessage);
        setPreview(value); // Revert to original value
        toast.error(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      } finally {
        setIsUploading(false);
      }
    },
    [maxSize, onChange, onError, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || isUploading,
  });

  const handleRemove = useCallback(() => {
    setPreview(undefined);
    setUploadError(undefined);
    onChange?.('');
  }, [onChange]);

  return (
    <Box>
      {preview ? (
        <Card>
          <Flex direction="column" gap="3">
            {/* Preview */}
            <Box
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-3)',
                overflow: 'hidden',
                maxHeight: '400px',
              }}
            >
              <Image
                src={preview}
                alt="Upload preview"
                placeholder="blur"
                placeholderText="Upload"
                objectFit="contain"
                style={{
                  maxHeight: '400px',
                }}
              />

              {/* Remove button */}
              <Button
                variant="solid"
                color="red"
                size="1"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                }}
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X size={16} />
              </Button>
            </Box>

            {/* File info */}
            <Flex align="center" gap="2">
              <FileImage size={16} style={{ color: 'var(--gray-11)' }} />
              <Text size="2" color="gray">
                {preview.split('/').pop()?.split('?')[0] || 'Image uploaded'}
              </Text>
            </Flex>
          </Flex>
        </Card>
      ) : (
        <Card>
          <Box
            {...getRootProps()}
            style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-3)',
              border: `2px dashed ${
                isDragActive
                  ? 'var(--accent-9)'
                  : uploadError
                  ? 'var(--red-9)'
                  : 'var(--gray-6)'
              }`,
              backgroundColor: isDragActive
                ? 'var(--accent-2)'
                : uploadError
                ? 'var(--red-2)'
                : 'var(--gray-2)',
              cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: disabled || isUploading ? 0.6 : 1,
            }}
          >
            <input {...getInputProps()} />

            <Flex direction="column" align="center" gap="3">
              {uploadError ? (
                <AlertCircle size={48} style={{ color: 'var(--red-9)' }} />
              ) : (
                <Upload
                  size={48}
                  style={{ color: isDragActive ? 'var(--accent-9)' : 'var(--gray-9)' }}
                />
              )}

              <Flex direction="column" align="center" gap="1">
                {isUploading ? (
                  <Text size="3" weight="medium">
                    Uploading...
                  </Text>
                ) : isDragActive ? (
                  <Text size="3" weight="medium" color="blue">
                    Drop the file here
                  </Text>
                ) : (
                  <>
                    <Text size="3" weight="medium">
                      {uploadError ? 'Upload failed' : 'Drag & drop an image here'}
                    </Text>
                    <Text size="2" color="gray">
                      or click to browse
                    </Text>
                  </>
                )}

                {uploadError && (
                  <Text size="2" color="red" mt="2">
                    {uploadError}
                  </Text>
                )}

                {!uploadError && !isUploading && (
                  <Text size="1" color="gray" mt="2">
                    Max {maxSize / 1024 / 1024}MB • PNG, JPG, GIF, WebP
                  </Text>
                )}
              </Flex>
            </Flex>
          </Box>
        </Card>
      )}
    </Box>
  );
}
