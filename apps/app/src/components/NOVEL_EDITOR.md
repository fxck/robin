# Novel Editor Component

A fully-featured Notion-style WYSIWYG editor for the Robin blogging platform, built with [Novel](https://novel.sh) and [Tiptap](https://tiptap.dev).

## Features

### 🎨 Rich Text Formatting
- **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~
- Inline `code`
- Text colors
- Links with auto-detection

### 📝 Block Types
- Headings (H1, H2, H3)
- Paragraphs
- Bullet lists
- Numbered lists
- Blockquotes
- Horizontal rules (dividers)
- Code blocks with syntax highlighting
- Task lists with checkboxes

### 🖼️ Image Handling
- **Drag & Drop** - Drop images directly into the editor
- **Copy & Paste** - Paste images from clipboard
- **Slash Command** - Type `/` and select "Image"
- **Auto Upload** - Images are automatically uploaded to your S3 bucket
- **Resizable** - Click and drag image corners to resize
- **Validation** - Automatic file size (10MB) and type validation

### ⌨️ Slash Commands
Press `/` anywhere to open the command menu:

- `/Heading 1` - Big section heading
- `/Heading 2` - Medium section heading
- `/Heading 3` - Small section heading
- `/Bullet List` - Create a bullet list
- `/Numbered List` - Create a numbered list
- `/Quote` - Insert a blockquote
- `/Divider` - Add a horizontal rule
- `/Image` - Upload an image

### 🎯 Bubble Menu
Select any text to show the formatting toolbar:
- Bold
- Italic
- Underline
- Strikethrough
- Code
- Link

### 🎨 Styling
- Prose typography with responsive sizing
- Dark mode support
- Tailwind CSS integration
- Minimum height of 500px
- Custom scrollbars
- Focused outline removal

## Usage

```tsx
import { NovelEditor } from '@/components/novel-editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <NovelEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      className="my-custom-class"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Editor content (required) |
| `onChange` | `(value: string) => void` | - | Callback when content changes (required) |
| `placeholder` | `string` | `"Press '/' for commands..."` | Placeholder text |
| `className` | `string` | - | Additional CSS classes |

## Image Upload

Images are automatically uploaded to your S3 bucket via the `/api/upload` endpoint.

**Validation:**
- Max file size: 10MB
- Allowed types: image/*
- Authenticated requests only (credentials: 'include')

**Upload Flow:**
1. User adds image (drag/drop, paste, or slash command)
2. File is validated (size and type)
3. FormData is created and sent to `/api/upload`
4. Image URL is returned and inserted into editor
5. Toast notification confirms success/failure

## Extensions Included

1. **StarterKit** - Basic editing functionality
   - Document, Paragraph, Text
   - Bold, Italic, Strike, Code
   - Heading (levels 1-3)
   - Bullet List, Ordered List
   - Blockquote
   - Code Block (with styling)
   - Hard Break
   - History (Undo/Redo)

2. **Placeholder** - Contextual placeholder text
3. **Link** - Clickable links with custom styling
4. **Underline** - Underline formatting
5. **TextStyle** - Base for color/font styling
6. **Color** - Text color support
7. **HorizontalRule** - Divider lines
8. **TaskList** - Checkbox lists
9. **TaskItem** - Nested task items
10. **UpdatedImage** - Enhanced image support with resizing
11. **ImageResizer** - Visual image resizing UI

## Keyboard Shortcuts

- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + U` - Underline
- `Cmd/Ctrl + Shift + S` - Strikethrough
- `Cmd/Ctrl + E` - Code
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `/` - Open command menu
- `↑` `↓` - Navigate command menu
- `Enter` - Execute command

## Architecture

```
NovelEditor
├── EditorRoot (Context Provider)
│   └── EditorContent (Main Editor)
│       ├── EditorCommand (Slash Command Menu)
│       │   ├── EditorCommandEmpty
│       │   └── EditorCommandList
│       │       └── EditorCommandItem (×8)
│       ├── EditorBubble (Selection Menu)
│       │   └── EditorBubbleItem (×6)
│       └── ImageResizer (Visual Resizer)
```

## Data Flow

1. **Initial Content** - `value` prop → converted to JSONContent → `initialContent` state
2. **User Edits** - Tiptap editor → `onUpdate` callback
3. **Export** - Editor content → `editor.getText()` → `onChange` callback

**Note:** Currently exports plain text. For production, consider:
- `editor.getJSON()` - Store structured content
- `editor.storage.markdown.getMarkdown()` - Export as Markdown
- Custom serializer - Convert to your preferred format

## Styling Customization

The editor uses Tailwind classes for styling. Key classes:

```css
/* Editor container */
.prose prose-lg dark:prose-invert focus:outline-none max-w-full p-4 min-h-[500px]

/* Command menu */
.z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-gray-200 bg-white px-1 py-2 shadow-md

/* Bubble menu */
.flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl

/* Code blocks */
.rounded-md bg-gray-100 p-4 font-mono text-sm

/* Links */
.text-blue-600 underline hover:text-blue-800

/* Images */
.rounded-lg
.opacity-40 rounded-lg (during upload)
```

## Error Handling

All errors are displayed via toast notifications:

- **Upload errors** - File too large, invalid type, network errors
- **Validation errors** - Automatic validation before upload
- **Network errors** - Failed API requests

## Performance Considerations

- **Lazy Loading** - Extensions are bundled with the component
- **Debounced Updates** - Editor updates are optimized by Tiptap
- **Image Optimization** - Images are uploaded to S3 for CDN delivery
- **Code Splitting** - Consider dynamic imports for the editor component

## Future Enhancements

- [ ] Markdown import/export
- [ ] JSON content storage
- [ ] Collaborative editing (Yjs)
- [ ] AI-powered autocomplete
- [ ] Custom themes
- [ ] Emoji picker
- [ ] Table support
- [ ] Embed support (YouTube, Twitter, etc.)
- [ ] Math equations (KaTeX)
- [ ] Mermaid diagrams
- [ ] Version history
- [ ] Comment threads

## Troubleshooting

### Editor not showing
- Check that all Novel dependencies are installed
- Verify Tailwind prose plugin is configured
- Ensure React 18+ is installed

### Images not uploading
- Check S3 credentials in environment variables
- Verify `/api/upload` endpoint is accessible
- Check authentication (cookies must be sent)
- Review browser console for CORS errors

### Slash commands not working
- Press `/` at the start of a new line
- Check that EditorCommand component is rendered
- Verify keyboard event handlers are not blocked

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that prose plugin is installed: `@tailwindcss/typography`
- Add custom CSS if needed

## Dependencies

```json
{
  "novel": "^1.0.2",
  "@tiptap/react": "^2.11.2",
  "@tiptap/core": "^2.11.2",
  "@tiptap/starter-kit": "^2.11.2",
  "lucide-react": "latest",
  "sonner": "latest"
}
```

## License

Part of the Robin blogging platform. See main project LICENSE.

## Resources

- [Novel Documentation](https://novel.sh/docs)
- [Tiptap Documentation](https://tiptap.dev)
- [Robin API Documentation](../../api/README.md)
