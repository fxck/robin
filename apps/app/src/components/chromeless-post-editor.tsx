import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

    const response = await fetch(`${API_BASE}/api/upload`, {
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
  lastSaved,
  isNewPost = false,
}: ChromelessPostEditorProps) {
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [initialContent] = useState<string | undefined>(content);

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
        setShowCoverUpload(false);
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
    Markdown,
    Placeholder.configure({
      placeholder: "Start writing your story... Press '/' for commands",
    }),
    TiptapLink.configure({
      HTMLAttributes: {
        class: 'text-purple-400 underline decoration-purple-400/30 hover:decoration-purple-400 transition-colors',
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
      {/* Top Control Bar - Floating, minimal */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-6">
          {/* Left: Exit */}
          <button
            onClick={onExit}
            className={cn(
              'group flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-white/5 hover:bg-white/10',
              'border border-white/10 hover:border-white/20',
              'text-gray-400 hover:text-gray-200',
              'transition-all duration-200',
              'backdrop-blur-xl'
            )}
          >
            <X size={16} />
            <span className="text-sm font-medium">Close</span>
          </button>

          {/* Center: Auto-save status */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            {isSaving ? (
              <>
                <Loader2 size={14} className="text-purple-400 animate-spin" />
                <span className="text-xs text-gray-400">Saving...</span>
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
                  'backdrop-blur-xl',
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
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
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
                'backdrop-blur-xl',
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
                'group relative px-6 py-2 rounded-full text-sm font-medium',
                'bg-gradient-to-r from-purple-500 to-pink-500',
                'hover:from-purple-600 hover:to-pink-600',
                'text-white',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg shadow-purple-500/25',
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

      {/* Main Editor Container */}
      <div className="h-full overflow-y-auto pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-8">
          {/* Cover Image Section */}
          <div className="mb-12">
            {coverImage ? (
              <div className="group relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-900/50 border border-white/5">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                  onClick={() => onCoverImageChange('')}
                  className={cn(
                    'absolute top-4 right-4',
                    'p-2 rounded-full',
                    'bg-red-500/90 hover:bg-red-600',
                    'text-white',
                    'opacity-0 group-hover:opacity-100',
                    'transition-all duration-200',
                    'backdrop-blur-sm'
                  )}
                >
                  <X size={18} />
                </button>
                <button
                  onClick={() => setShowCoverUpload(true)}
                  className={cn(
                    'absolute top-4 left-4',
                    'px-4 py-2 rounded-full',
                    'bg-white/10 hover:bg-white/20',
                    'text-white text-sm font-medium',
                    'opacity-0 group-hover:opacity-100',
                    'transition-all duration-200',
                    'backdrop-blur-sm border border-white/20'
                  )}
                >
                  Change Cover
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCoverUpload(!showCoverUpload)}
                className={cn(
                  'group relative w-full py-8 rounded-2xl',
                  'border-2 border-dashed transition-all duration-300',
                  showCoverUpload
                    ? 'border-purple-500/50 bg-purple-500/5'
                    : 'border-white/10 hover:border-purple-500/30 bg-white/[0.02] hover:bg-purple-500/5'
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    'p-3 rounded-full transition-all duration-300',
                    showCoverUpload
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-white/5 text-gray-500 group-hover:bg-purple-500/10 group-hover:text-purple-400'
                  )}>
                    <ImagePlus size={24} />
                  </div>
                  <div>
                    <p className={cn(
                      'text-sm font-medium transition-colors',
                      showCoverUpload ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                    )}>
                      Add a cover image
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Click to browse or drag and drop
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Cover Upload Dropzone */}
            {showCoverUpload && !coverImage && (
              <div className="mt-4">
                <div
                  {...getCoverRootProps()}
                  className={cn(
                    'relative p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
                    isDragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5'
                  )}
                >
                  <input {...getCoverInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    {isUploadingCover ? (
                      <>
                        <Loader2 size={48} className="text-purple-400 animate-spin" />
                        <p className="text-sm text-gray-400">Uploading cover image...</p>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={48} className={isDragActive ? 'text-purple-400' : 'text-gray-500'} />
                        <div className="text-center">
                          <p className={cn(
                            'text-sm font-medium',
                            isDragActive ? 'text-purple-400' : 'text-gray-400'
                          )}>
                            {isDragActive ? 'Drop your image here' : 'Drag & drop your cover image'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            or click to browse • Max 10MB • PNG, JPG, GIF, WebP
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="mb-8">
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Give your story a title..."
              rows={1}
              className={cn(
                'w-full resize-none overflow-hidden',
                'bg-transparent border-none outline-none',
                'text-5xl font-bold text-white',
                'placeholder:text-gray-700',
                'leading-tight'
              )}
              style={{ fontFamily: 'var(--font-heading, system-ui)' }}
            />
          </div>

          {/* Content Editor */}
          <div className="mb-20">
            <EditorRoot>
              <EditorContent
                initialContent={initialContent}
                extensions={extensions}
                editorProps={{
                  attributes: {
                    class: cn(
                      'prose prose-lg prose-invert max-w-none',
                      'focus:outline-none',
                      'prose-headings:font-bold prose-headings:text-white',
                      'prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4',
                      'prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4',
                      'prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3',
                      'prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4',
                      'prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline',
                      'prose-strong:text-white prose-strong:font-semibold',
                      'prose-em:text-gray-300',
                      'prose-code:text-purple-400 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
                      'prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-white/10',
                      'prose-blockquote:border-l-purple-500 prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:text-gray-400 prose-blockquote:italic',
                      'prose-ul:text-gray-300 prose-ol:text-gray-300',
                      'prose-li:my-2',
                      'prose-img:rounded-lg prose-img:my-8',
                      'prose-hr:border-white/10 prose-hr:my-8',
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
                    return handleImagePaste(view, event, uploadFn);
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
                          'aria-selected:bg-purple-500/10 aria-selected:text-purple-400',
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
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs text-gray-500">
          <span className="text-gray-600">⌘S</span> Save • <span className="text-gray-600">⌘⇧P</span> Publish • <span className="text-gray-600">ESC</span> Close
        </div>
      </div>
    </div>
  );
}
