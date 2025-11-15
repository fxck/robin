import { EditorRoot, EditorContent, type JSONContent } from 'novel';
import { Box } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

interface NovelEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NovelEditor({ value, onChange, className }: NovelEditorProps) {
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>();

  // Convert markdown to JSON content on mount
  useEffect(() => {
    if (value) {
      // For now, we'll use a simple text node structure
      // In production, you might want to use a markdown parser
      setInitialContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: value }],
          },
        ],
      });
    }
  }, []);

  return (
    <Box className={className}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={[]}
          editorProps={{
            attributes: {
              class: 'novel-editor prose prose-lg focus:outline-none max-w-full',
            },
          }}
          onUpdate={({ editor }) => {
            // Get the text content from the editor
            const text = editor.getText();
            onChange(text);
          }}
        />
      </EditorRoot>
    </Box>
  );
}
