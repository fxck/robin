import { Editor } from 'novel';
import { Box } from '@radix-ui/themes';
import { toast } from 'sonner';

interface NovelEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Custom upload function to use your existing S3 endpoint
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      throw new Error('File too large');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      throw new Error('Invalid file type');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    toast.success('Image uploaded successfully!');

    return data.url;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    throw error;
  }
};

export function NovelEditor({ value, onChange, placeholder, className }: NovelEditorProps) {
  return (
    <Box className={className}>
      <Editor
        defaultValue={value}
        onDebouncedUpdate={(editor) => {
          // Get the markdown content from the editor
          if (editor) {
            const markdown = editor.storage.markdown.getMarkdown();
            onChange(markdown);
          }
        }}
        onUpload={handleImageUpload}
        disableLocalStorage
        className="novel-editor"
      />
    </Box>
  );
}
