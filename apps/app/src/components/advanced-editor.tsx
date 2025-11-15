import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  type JSONContent,
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
import { Box, Flex, Button, Text, IconButton, Separator } from '@radix-ui/themes';
import { toast } from 'sonner';
import { useEffect, useState, useRef } from 'react';
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
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Check,
  Clock,
} from 'lucide-react';

interface AdvancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  placeholder?: string;
  className?: string;
}

// Custom upload function
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      throw new Error('File too large');
    }

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
            // Error already handled
          }
        }
      };
      input.click();
    },
  },
];

function MarkdownPreview({ content }: { content: string }) {
  return (
    <Box
      className="prose prose-lg dark:prose-invert max-w-full p-8"
      style={{
        minHeight: '500px',
        background: 'var(--color-background)',
      }}
      dangerouslySetInnerHTML={{
        __html: content
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
          .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
          .replace(/\n/gim, '<br />'),
      }}
    />
  );
}

export function AdvancedEditor({
  value,
  onChange,
  onSave,
  isSaving = false,
  lastSaved = null,
  placeholder = "Press '/' for commands...",
  className,
}: AdvancedEditorProps) {
  const [initialContent, setInitialContent] = useState<JSONContent | string | undefined>(value);
  const [contentKey, setContentKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update content when value prop changes
  useEffect(() => {
    if (value && value !== initialContent) {
      setInitialContent(value);
      setContentKey((prev) => prev + 1);
    }
  }, [value, initialContent]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFullscreen]);

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

  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Box
      ref={containerRef}
      className={className}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : undefined,
        background: isFullscreen ? 'var(--color-background)' : undefined,
        overflow: isFullscreen ? 'hidden' : undefined,
      }}
    >
      {/* Floating Toolbar */}
      <Flex
        direction="column"
        style={{
          position: isFullscreen ? 'sticky' : 'relative',
          top: isFullscreen ? 0 : undefined,
          background: 'var(--color-panel)',
          borderBottom: '1px solid var(--gray-5)',
          zIndex: 100,
        }}
      >
        <Flex justify="between" align="center" p="3" gap="3">
          {/* Left: Formatting tools */}
          <Flex gap="1" wrap="wrap">
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleBold().run()}
              color={editorInstance?.isActive('bold') ? 'purple' : 'gray'}
            >
              <Bold size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleItalic().run()}
              color={editorInstance?.isActive('italic') ? 'purple' : 'gray'}
            >
              <Italic size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleUnderline().run()}
              color={editorInstance?.isActive('underline') ? 'purple' : 'gray'}
            >
              <UnderlineIcon size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleStrike().run()}
              color={editorInstance?.isActive('strike') ? 'purple' : 'gray'}
            >
              <Strikethrough size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleCode().run()}
              color={editorInstance?.isActive('code') ? 'purple' : 'gray'}
            >
              <Code size={16} />
            </IconButton>

            <Separator orientation="vertical" style={{ height: '24px', margin: '0 4px' }} />

            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleHeading({ level: 1 }).run()}
              color={editorInstance?.isActive('heading', { level: 1 }) ? 'purple' : 'gray'}
            >
              <Heading1 size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleHeading({ level: 2 }).run()}
              color={editorInstance?.isActive('heading', { level: 2 }) ? 'purple' : 'gray'}
            >
              <Heading2 size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleHeading({ level: 3 }).run()}
              color={editorInstance?.isActive('heading', { level: 3 }) ? 'purple' : 'gray'}
            >
              <Heading3 size={16} />
            </IconButton>

            <Separator orientation="vertical" style={{ height: '24px', margin: '0 4px' }} />

            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleBulletList().run()}
              color={editorInstance?.isActive('bulletList') ? 'purple' : 'gray'}
            >
              <List size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleOrderedList().run()}
              color={editorInstance?.isActive('orderedList') ? 'purple' : 'gray'}
            >
              <ListOrdered size={16} />
            </IconButton>
            <IconButton
              size="2"
              variant="ghost"
              onClick={() => editorInstance?.chain().focus().toggleBlockquote().run()}
              color={editorInstance?.isActive('blockquote') ? 'purple' : 'gray'}
            >
              <Quote size={16} />
            </IconButton>
          </Flex>

          {/* Right: View controls and auto-save */}
          <Flex gap="2" align="center">
            {/* Auto-save indicator */}
            {lastSaved && (
              <Flex align="center" gap="1">
                {isSaving ? (
                  <>
                    <Clock size={14} style={{ color: 'var(--gray-9)' }} />
                    <Text size="1" color="gray">
                      Saving...
                    </Text>
                  </>
                ) : (
                  <>
                    <Check size={14} style={{ color: 'var(--green-9)' }} />
                    <Text size="1" color="gray">
                      {formatLastSaved(lastSaved)}
                    </Text>
                  </>
                )}
              </Flex>
            )}

            {/* Preview toggle */}
            <Button
              size="2"
              variant={showPreview ? 'solid' : 'soft'}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Edit3 size={16} /> : <Eye size={16} />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            {/* Fullscreen toggle */}
            <IconButton
              size="2"
              variant="soft"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </IconButton>
          </Flex>
        </Flex>
      </Flex>

      {/* Editor Content */}
      <Box
        style={{
          height: isFullscreen ? 'calc(100vh - 60px)' : '600px',
          overflow: 'auto',
        }}
      >
        {showPreview ? (
          <MarkdownPreview content={value} />
        ) : (
          <EditorRoot key={contentKey}>
            <EditorContent
              initialContent={initialContent}
              extensions={extensions}
              onCreate={({ editor }) => {
                setEditorInstance(editor);
              }}
              editorProps={{
                attributes: {
                  class: 'prose prose-lg dark:prose-invert focus:outline-none max-w-full p-8 min-h-full',
                },
                handleDrop: (view, event, _slice, moved) => {
                  return handleImageDrop(view, event, moved, uploadFn);
                },
                handlePaste: (view, event) => {
                  return handleImagePaste(view, event, uploadFn);
                },
              }}
              onUpdate={({ editor }) => {
                const markdown = editor.storage.markdown.getMarkdown();
                onChange(markdown);
              }}
            >
              {/* Slash Command Menu */}
              <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-gray-200 bg-white px-1 py-2 shadow-md transition-all">
                <EditorCommandEmpty className="px-2 text-gray-500">No results</EditorCommandEmpty>
                <EditorCommandList>
                  {suggestionItems.map((item) => (
                    <EditorCommandItem
                      key={item.title}
                      onCommand={(val) => item.command(val)}
                      className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </EditorCommandItem>
                  ))}
                </EditorCommandList>
              </EditorCommand>

              {/* Image Resizer */}
              <ImageResizer />
            </EditorContent>
          </EditorRoot>
        )}
      </Box>
    </Box>
  );
}
