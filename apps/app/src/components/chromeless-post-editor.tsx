import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar as RadixAvatar } from '@radix-ui/themes';
import {
  X,
  Check,
  ImagePlus,
  Loader2,
  ChevronDown,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from '../lib/utils';
import { useSession } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Parse markdown text and insert as rich content
const parseAndInsertMarkdown = (editor: any, text: string, from: number, to: number) => {
  // Build HTML from markdown
  let html = '';
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      html += '<p></p>';
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, or ___
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      html += '<hr />';
      i++;
      continue;
    }

    // Check for standalone images (must be alone on a line)
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const alt = imageMatch[1];
      const src = imageMatch[2];
      html += `<img src="${src}" alt="${alt}" />`;
      i++;
      continue;
    }

    // Check for headings first (must be at start of line)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = parseInlineMarkdown(headingMatch[2]);
      html += `<h${level}>${headingText}</h${level}>`;
      i++;
      continue;
    }

    // Check for unordered list items (-, *, +)
    const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (unorderedListMatch) {
      html += '<ul>';
      while (i < lines.length) {
        const listLine = lines[i];
        const listItemMatch = listLine.match(/^[\s]*[-*+]\s+(.+)$/);
        if (!listItemMatch) break;

        const itemText = parseInlineMarkdown(listItemMatch[1]);
        html += `<li>${itemText}</li>`;
        i++;
      }
      html += '</ul>';
      continue;
    }

    // Check for ordered list items (1., 2., etc.)
    const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (orderedListMatch) {
      html += '<ol>';
      while (i < lines.length) {
        const listLine = lines[i];
        const listItemMatch = listLine.match(/^[\s]*\d+\.\s+(.+)$/);
        if (!listItemMatch) break;

        const itemText = parseInlineMarkdown(listItemMatch[1]);
        html += `<li>${itemText}</li>`;
        i++;
      }
      html += '</ol>';
      continue;
    }

    // Check for blockquotes
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      html += '<blockquote>';
      while (i < lines.length) {
        const quoteLine = lines[i];
        const quoteMatch = quoteLine.match(/^>\s+(.+)$/);
        if (!quoteMatch) break;

        const quoteText = parseInlineMarkdown(quoteMatch[1]);
        html += `<p>${quoteText}</p>`;
        i++;
      }
      html += '</blockquote>';
      continue;
    }

    // Regular paragraph with inline markdown
    const processedHTML = parseInlineMarkdown(line);
    html += `<p>${processedHTML}</p>`;
    i++;
  }

  // Delete selection and insert the parsed HTML
  editor.chain().focus().deleteRange({ from, to }).insertContent(html).run();
};

// Helper to parse inline markdown (bold, italic, links, code, inline images)
const parseInlineMarkdown = (text: string): string => {
  let result = text;

  // Inline code: `code` - do this first to protect code content from other replacements
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Inline images: ![alt](url) - must come before links
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold: **text** - non-greedy match
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* - only single asterisks (not part of double)
  // Use a more compatible regex without lookbehind
  result = result.replace(/\b\*([^*\s][^*]*?)\*\b/g, '<em>$1</em>');

  // Italic: _text_
  result = result.replace(/\b_([^_\s][^_]*?)_\b/g, '<em>$1</em>');

  return result;
};

interface ChromelessPostEditorProps {
  title: string;
  content: string;
  coverImage: string;
  status: 'draft' | 'published';
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onCoverImageChange: (url: string) => void;
  onStatusChange: (status: 'draft' | 'published') => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onExit: () => void;
  isPublishing: boolean;
  isSaving: boolean;
  isPending?: boolean;
  lastSaved: Date | null;
  isNewPost?: boolean;
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

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
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

export function ChromelessPostEditor({
  title,
  content,
  coverImage,
  status,
  onTitleChange,
  onContentChange,
  onCoverImageChange,
  onStatusChange,
  onPublish,
  onSaveDraft,
  onExit,
  isPublishing,
  isSaving,
  isPending = false,
  lastSaved,
  isNewPost = false,
}: ChromelessPostEditorProps) {
  const { data: session } = useSession();
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const editorRef = useRef<any>(null);

  // Auto-resize title textarea
  const adjustTitleHeight = useCallback(() => {
    const textarea = titleInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTitleHeight();
  }, [title, adjustTitleHeight]);

  // Focus title on mount for new posts
  useEffect(() => {
    if (isNewPost && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isNewPost]);

  // Handle cover image upload
  const onDropCover = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      try {
        setIsUploadingCover(true);
        const url = await handleImageUpload(file);
        onCoverImageChange(url);
        toast.success('Cover image uploaded!');
      } catch (error) {
        // Error already handled
      } finally {
        setIsUploadingCover(false);
      }
    },
    [onCoverImageChange]
  );

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploadingCover,
    noClick: false,
  });

  // Editor extensions
  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900/50 p-4 font-mono text-sm text-gray-100 border border-white/10',
        },
      },
    }),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
      breaks: true,
    }),
    Placeholder.configure({
      placeholder: "Start writing your story... Press '/' for commands",
    }),
    TiptapLink.configure({
      HTMLAttributes: {
        class: 'text-amber-400 underline decoration-amber-400/30 hover:decoration-amber-400 transition-colors',
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save draft
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSaveDraft();
      }
      // Cmd/Ctrl + Shift + P to publish
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        onPublish();
      }
      // Escape to exit
      if (e.key === 'Escape' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSaveDraft, onPublish, onExit]);

  // Format last saved time
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastSaved]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Main Editor Container - Matches post detail exactly */}
      <div className="h-full overflow-y-auto">

        {/* Hero Section with Cover Image - EXACTLY like post detail */}
        <section className="relative min-h-[70vh] flex items-end pb-12 md:pb-16">
          {/* Hero Background Image with gradient overlay */}
          {coverImage ? (
            <div className="absolute inset-0 z-0 group">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay: transparent (top) → black (bottom) - EXACT match */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 100%)',
                }}
              />
              {/* Extended gradient below cover - EXACT match */}
              <div
                className="absolute left-0 right-0 h-[100px] pointer-events-none"
                style={{
                  bottom: '-100px',
                  backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, transparent 100%)',
                }}
              />
            </div>
          ) : (
            // No cover - show upload area with same positioning
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
              <div
                {...getCoverRootProps()}
                className={cn(
                  'relative p-16 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer max-w-2xl',
                  isDragActive
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/20 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5'
                )}
              >
                <input {...getCoverInputProps()} />
                <div className="flex flex-col items-center gap-6">
                  {isUploadingCover ? (
                    <>
                      <Loader2 size={64} className="text-amber-400 animate-spin" />
                      <p className="text-base text-gray-400">Uploading cover image...</p>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={64} className={isDragActive ? 'text-amber-400' : 'text-gray-500'} />
                      <div className="text-center">
                        <p className={cn(
                          'text-base font-medium mb-2',
                          isDragActive ? 'text-amber-400' : 'text-gray-300'
                        )}>
                          {isDragActive ? 'Drop your image here' : 'Drag & drop your cover image'}
                        </p>
                        <p className="text-sm text-gray-600">
                          or click to browse • Max 10MB • PNG, JPG, GIF, WebP
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero Content - Title and Author Meta - EXACT MATCH to post detail */}
          <div className="relative z-10 w-full mx-auto px-5 md:px-8 max-w-reading">
            {/* Cover Controls - Subtle and positioned above title */}
            {coverImage && (
              <div className="mb-6 flex items-center gap-3">
                <div
                  {...getCoverRootProps()}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-white/5 hover:bg-white/10',
                    'text-gray-400 hover:text-white text-xs font-medium',
                    'transition-all duration-200',
                    'backdrop-blur-sm border border-white/10',
                    'cursor-pointer'
                  )}
                >
                  <input {...getCoverInputProps()} />
                  <span className="flex items-center gap-2">
                    <ImagePlus size={14} />
                    Change
                  </span>
                </div>
                <button
                  onClick={() => onCoverImageChange('')}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-white/5 hover:bg-red-500/10',
                    'text-gray-400 hover:text-red-400 text-xs font-medium',
                    'transition-all duration-200',
                    'backdrop-blur-sm border border-white/10 hover:border-red-500/30'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <X size={14} />
                    Remove
                  </span>
                </button>
              </div>
            )}

            <div className="space-y-6 max-w-full">
              {/* Title Input - Styled exactly like display title */}
              <textarea
                ref={titleInputRef}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Name your story..."
                rows={1}
                className={cn(
                  'w-full resize-none overflow-hidden',
                  'bg-transparent border-none outline-none focus:outline-none focus:ring-0',
                  'font-serif font-bold text-text-primary',
                  'placeholder:text-gray-700',
                  // Match EXACT display typography from Heading component
                  'text-display leading-display tracking-display'
                )}
                style={{
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)'
                }}
              />

              {/* Author Meta - Read-only, matches post detail exactly */}
              <div className="flex items-center gap-4">
                <RadixAvatar
                  size="3"
                  src={session?.user?.image || undefined}
                  fallback={session?.user?.name?.[0] || 'A'}
                  radius="full"
                />
                <div>
                  <div className="text-base font-medium text-white hover:text-amber-400 transition-colors cursor-pointer">
                    {session?.user?.name || 'Your Name'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                    <span>·</span>
                    <span>{Math.max(1, Math.ceil(content.split(' ').length / 200))} min read</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} />
                      <span>0</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content - EXACT match to post detail */}
        <div className="mx-auto px-5 md:px-8 max-w-reading py-12">
          <article
            id="article-content"
            className={cn(
              // EXACT prose classes from post detail
              'prose prose-lg dark:prose-invert max-w-full',
              'prose-headings:font-serif prose-headings:font-bold prose-headings:scroll-mt-32',
              'prose-p:text-text-primary prose-p:leading-relaxed',
              'prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline',
              'prose-code:text-amber-300',
              'prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-white/10'
            )}
          >
              <EditorRoot>
                <EditorContent
                  extensions={extensions}
                  onCreate={({ editor }) => {
                    editorRef.current = editor;
                    if (content) {
                      editor.commands.setContent(content);
                    }
                  }}
                  editorProps={{
                    attributes: {
                      class: cn(
                        'prose prose-lg prose-invert max-w-none min-h-[60vh]',
                        'focus:outline-none focus:ring-0 focus:border-transparent',
                        '[&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:focus:border-transparent',
                        // Match EXACT typography from styles.css .prose
                        'prose-headings:font-serif prose-headings:font-bold prose-headings:text-white',
                        'prose-h1:text-[clamp(2rem,4vw,3rem)] prose-h1:leading-[1.2] prose-h1:tracking-[-0.015em] prose-h1:mt-[var(--space-9)] prose-h1:mb-[var(--space-6)]',
                        'prose-h2:text-[clamp(1.5rem,3vw,2.25rem)] prose-h2:leading-[1.3] prose-h2:tracking-[-0.01em] prose-h2:mt-[var(--space-9)] prose-h2:mb-[var(--space-5)]',
                        'prose-h3:text-[clamp(1.25rem,2.5vw,1.75rem)] prose-h3:leading-[1.4] prose-h3:tracking-[-0.005em] prose-h3:mt-[var(--space-8)] prose-h3:mb-[var(--space-4)] prose-h3:font-semibold',
                        'prose-p:text-[clamp(1.125rem,1.5vw,1.3125rem)] prose-p:leading-[1.7] prose-p:text-text-primary prose-p:mb-[var(--space-5)]',
                        'prose-a:text-amber-400 prose-a:no-underline prose-a:border-b prose-a:border-amber-400/30 hover:prose-a:border-amber-400 hover:prose-a:text-amber-500',
                        'prose-strong:text-white prose-strong:font-semibold',
                        'prose-em:text-gray-300',
                        'prose-code:font-mono prose-code:text-[0.9em] prose-code:text-amber-400 prose-code:bg-amber-500/10 prose-code:border prose-code:border-amber-500/20 prose-code:px-[0.4em] prose-code:py-[0.2em] prose-code:rounded',
                        'prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-[var(--space-6)] prose-pre:my-[var(--space-7)]',
                        'prose-blockquote:border-l-[3px] prose-blockquote:border-l-amber-500 prose-blockquote:pl-[var(--space-6)] prose-blockquote:text-gray-400 prose-blockquote:italic prose-blockquote:my-[var(--space-7)]',
                        'prose-ul:text-gray-300 prose-ul:pl-[var(--space-6)] prose-ul:my-[var(--space-5)]',
                        'prose-ol:text-gray-300 prose-ol:pl-[var(--space-6)] prose-ol:my-[var(--space-5)]',
                        'prose-li:my-[var(--space-3)] prose-li:leading-[1.7]',
                        'prose-img:rounded-xl prose-img:my-[var(--space-8)] prose-img:max-w-full',
                        'prose-hr:border-white/10 prose-hr:my-[var(--space-8)]',
                        '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                        '[&_.is-editor-empty:first-child::before]:text-gray-700',
                        '[&_.is-editor-empty:first-child::before]:float-left',
                        '[&_.is-editor-empty:first-child::before]:h-0',
                        '[&_.is-editor-empty:first-child::before]:pointer-events-none'
                      ),
                    },
                    handleDrop: (view, event, _slice, moved) => {
                      return handleImageDrop(view, event, moved, uploadFn);
                    },
                    handlePaste: (view, event) => {
                      // First check if there's an image being pasted
                      const hasImagePaste = handleImagePaste(view, event, uploadFn);
                      if (hasImagePaste) return true;

                      // Check if clipboard contains text with markdown
                      const text = event.clipboardData?.getData('text/plain');
                      if (!text) return false;

                      // Check if text contains markdown syntax (multiline flag for headings)
                      const hasMarkdown = /^#{1,6}\s|!\[.+\]\(.+\)|\[.+\]\(.+\)|\*\*.+\*\*|\*[^*]+\*|`.+`/m.test(text);

                      if (hasMarkdown && editorRef.current) {
                        // Prevent default paste
                        event.preventDefault();

                        // Get selection position
                        const { state } = view;
                        const { selection } = state;

                        // Use the editor ref
                        parseAndInsertMarkdown(editorRef.current, text, selection.from, selection.to);

                        return true;
                      }

                      // Let default handler process non-markdown text
                      return false;
                    },
                  }}
                  onUpdate={({ editor }) => {
                    const markdown = editor.storage.markdown.getMarkdown();
                    onContentChange(markdown);
                  }}
                >
                  {/* Slash Command Menu */}
                  <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-xl px-1 py-2 shadow-2xl transition-all bg-gray-900 border border-white/10 backdrop-blur-xl">
                    <EditorCommandEmpty className="px-3 py-2 text-gray-500 text-sm">
                      No results
                    </EditorCommandEmpty>
                    <EditorCommandList>
                      {suggestionItems.map((item) => (
                        <EditorCommandItem
                          key={item.title}
                          onCommand={(val) => item.command(val)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left',
                            'text-gray-400 hover:text-white',
                            'hover:bg-white/5',
                            'aria-selected:bg-amber-500/10 aria-selected:text-amber-400',
                            'transition-colors cursor-pointer'
                          )}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-gray-600">{item.description}</p>
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
                    className="flex w-fit max-w-[90vw] overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-gray-900 backdrop-blur-xl"
                  >
                    <EditorBubbleItem
                      onSelect={(editor) => editor.chain().focus().toggleBold().run()}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Bold className="h-4 w-4" />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Italic className="h-4 w-4" />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      onSelect={(editor) => editor.chain().focus().toggleUnderline().run()}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </EditorBubbleItem>
                    <EditorBubbleItem
                      onSelect={(editor) => editor.chain().focus().toggleCode().run()}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Code className="h-4 w-4" />
                    </EditorBubbleItem>
                    <div className="w-px bg-white/10 my-1.5" />
                    <EditorBubbleItem
                      onSelect={(editor) => {
                        const url = window.prompt('Enter URL:');
                        if (url) {
                          editor.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      className="p-2.5 hover:bg-white/10 active:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Link className="h-4 w-4" />
                    </EditorBubbleItem>
                  </EditorBubble>

                  {/* Image Resizer */}
                  <ImageResizer />
                </EditorContent>
              </EditorRoot>
          </article>

          {/* Bottom spacing to match post detail */}
          <div className="h-32" />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10">
          {/* Left: Exit */}
          <button
            onClick={onExit}
            className={cn(
              'group flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-white/5 hover:bg-white/10',
              'border border-white/10 hover:border-white/20',
              'text-gray-400 hover:text-gray-200',
              'transition-all duration-200'
            )}
          >
            <X size={16} />
            <span className="text-sm font-medium">Close</span>
          </button>

          {/* Center: Auto-save status */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            {isSaving ? (
              <>
                <Loader2 size={14} className="text-amber-400 animate-spin" />
                <span className="text-xs text-gray-400">Saving...</span>
              </>
            ) : isPending ? (
              <>
                <Clock size={14} className="text-amber-400 animate-pulse" />
                <span className="text-xs text-gray-400">Pending...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-xs text-gray-400">Saved {formatLastSaved()}</span>
              </>
            ) : (
              <>
                <Clock size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500">Not saved</span>
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Status Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full',
                  'border transition-all duration-200',
                  status === 'published'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                )}
              >
                {status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="text-sm font-medium capitalize">{status}</span>
                <ChevronDown size={14} />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    <button
                      onClick={() => {
                        onStatusChange('draft');
                        setShowStatusMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        status === 'draft'
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      )}
                    >
                      <EyeOff size={16} />
                      <div>
                        <div className="text-sm font-medium">Draft</div>
                        <div className="text-xs text-gray-500">Only you can see</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange('published');
                        setShowStatusMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        status === 'published'
                          ? 'bg-green-500/10 text-green-400'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      )}
                    >
                      <Eye size={16} />
                      <div>
                        <div className="text-sm font-medium">Published</div>
                        <div className="text-xs text-gray-500">Visible to everyone</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Save Draft */}
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                'bg-white/5 hover:bg-white/10',
                'border border-white/10 hover:border-white/20',
                'text-gray-300 hover:text-white',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Save Draft
            </button>

            {/* Publish */}
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className={cn(
                'group relative px-6 py-2 rounded-lg text-sm font-semibold',
                'bg-gradient-to-br from-amber-400 to-amber-500',
                'hover:from-amber-500 hover:to-amber-600',
                'text-black',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5',
                'overflow-hidden'
              )}
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Publish
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
