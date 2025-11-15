import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  EditorBubble,
  EditorBubbleItem,
  createImageUpload,
  handleImageDrop,
  handleImagePaste,
  UpdatedImage,
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapUnderline,
  TextStyle,
  Color,
  HorizontalRule,
  TaskList,
  TaskItem,
  ImageResizer,
} from 'novel';
import { Markdown } from 'tiptap-markdown';
import { Box } from '@radix-ui/themes';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Link,
} from 'lucide-react';

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
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    toast.success('Image uploaded successfully!');

    return data.url;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    throw error;
  }
};

// Slash command suggestions
const suggestionItems = [
  {
    title: 'Heading 1',
    description: 'Big section heading',
    icon: <Heading1 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading3 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: <List size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: <Quote size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Divider',
    description: 'Visually divide blocks',
    icon: <Minus size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Image',
    description: 'Upload an image',
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const url = await handleImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            // Error already handled in handleImageUpload
          }
        }
      };
      input.click();
    },
  },
];

export function NovelEditor({ value, onChange, placeholder = "Press '/' for commands...", className }: NovelEditorProps) {
  // Only set initial content once when component mounts
  const [initialContent] = useState<string | undefined>(value);

  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'rounded-md bg-gray-100 p-4 font-mono text-sm',
        },
      },
    }),
    Markdown,
    Placeholder.configure({
      placeholder,
    }),
    TiptapLink.configure({
      HTMLAttributes: {
        class: 'text-blue-600 underline hover:text-blue-800',
      },
    }),
    TiptapUnderline,
    TextStyle,
    Color,
    HorizontalRule,
    TaskList.configure({
      HTMLAttributes: {
        class: 'not-prose',
      },
    }),
    TaskItem.configure({
      nested: true,
    }),
    UpdatedImage.configure({
      HTMLAttributes: {
        class: 'rounded-lg',
      },
    }),
  ];

  const uploadFn = createImageUpload({
    validateFn: (file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return false;
      }
      return true;
    },
    onUpload: handleImageUpload,
  });

  return (
    <Box className={className}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          editorProps={{
            attributes: {
              class: 'prose prose-lg dark:prose-invert focus:outline-none max-w-full p-4 min-h-[500px]',
            },
            handleDrop: (view, event, _slice, moved) => {
              return handleImageDrop(view, event, moved, uploadFn);
            },
            handlePaste: (view, event) => {
              return handleImagePaste(view, event, uploadFn);
            },
          }}
          onUpdate={({ editor }) => {
            // Get markdown content from the editor
            const markdown = editor.storage.markdown.getMarkdown();
            onChange(markdown);
          }}
        >
          {/* Slash Command Menu */}
          <EditorCommand
            className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md px-1 py-2 shadow-md transition-all"
            style={{
              border: '1px solid var(--gray-6)',
              background: 'var(--color-panel)',
            }}
          >
            <EditorCommandEmpty className="px-2" style={{ color: 'var(--gray-9)' }}>
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  key={item.title}
                  onCommand={(val) => item.command(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm aria-selected:bg-[var(--gray-4)] hover:bg-[var(--gray-3)]"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{
                      border: '1px solid var(--gray-6)',
                      background: 'var(--color-panel)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--gray-12)' }}>
                      {item.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--gray-9)' }}>
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Bubble Menu for text formatting */}
          <EditorBubble
            tippyOptions={{
              placement: 'top',
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md shadow-xl border-[var(--gray-6)] bg-[var(--color-panel)]"
          >
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleBold().run()}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <Bold className={`h-4 w-4`} />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <Italic className={`h-4 w-4`} />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleUnderline().run()}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <UnderlineIcon className={`h-4 w-4`} />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <Strikethrough className={`h-4 w-4`} />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleCode().run()}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <Code className={`h-4 w-4`} />
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) => {
                const url = window.prompt('Enter URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className="p-2 hover:bg-[var(--gray-3)] active:bg-[var(--gray-4)]"
              style={{ color: 'var(--gray-11)' }}
            >
              <Link className={`h-4 w-4`} />
            </EditorBubbleItem>
          </EditorBubble>

          {/* Image Resizer */}
          <ImageResizer />
        </EditorContent>
      </EditorRoot>
    </Box>
  );
}
