/**
 * Novel Editor Demo Component
 *
 * This is a demonstration of the NovelEditor component.
 * You can use this as a reference for integrating the editor into your app.
 *
 * To test this component, import it in one of your routes:
 *
 * ```tsx
 * import { NovelEditorDemo } from '@/components/novel-editor-demo';
 *
 * export function MyRoute() {
 *   return <NovelEditorDemo />;
 * }
 * ```
 */

import { useState } from 'react';
import { NovelEditor } from './novel-editor';
import { Box, Container, Heading, Text, Card, Flex, Button } from '@radix-ui/themes';

export function NovelEditorDemo() {
  const [content, setContent] = useState('Start typing here... Press / for commands!');
  const [showRaw, setShowRaw] = useState(false);

  return (
    <Container size="3" p="4">
      <Box mb="6">
        <Heading size="8" mb="2">Novel Editor Demo</Heading>
        <Text color="gray">
          A fully-featured Notion-style WYSIWYG editor with image uploads, slash commands, and more.
        </Text>
      </Box>

      <Card mb="4">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="5">Editor</Heading>
            <Button
              variant="soft"
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? 'Hide' : 'Show'} Raw Output
            </Button>
          </Flex>

          <NovelEditor
            value={content}
            onChange={setContent}
            placeholder="Type '/' for commands, or just start writing..."
            className="border border-gray-200 rounded-lg"
          />

          {showRaw && (
            <Box>
              <Text size="2" weight="bold" mb="2">Raw Content:</Text>
              <Box
                p="3"
                style={{
                  backgroundColor: 'var(--gray-2)',
                  borderRadius: 'var(--radius-2)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {content}
              </Box>
            </Box>
          )}
        </Flex>
      </Card>

      <Card>
        <Heading size="4" mb="3">Features to Try</Heading>
        <Flex direction="column" gap="2">
          <Text>✨ <strong>Slash Commands:</strong> Type <code>/</code> to open the command menu</Text>
          <Text>🎨 <strong>Text Selection:</strong> Select text to show the formatting toolbar</Text>
          <Text>🖼️ <strong>Image Upload:</strong> Drag & drop images, paste from clipboard, or use <code>/image</code></Text>
          <Text>⌨️ <strong>Keyboard Shortcuts:</strong> Cmd/Ctrl + B (bold), I (italic), U (underline), etc.</Text>
          <Text>📋 <strong>Lists:</strong> Use <code>/bullet</code> or <code>/numbered</code> for lists</Text>
          <Text>📐 <strong>Image Resize:</strong> Click on any image to resize it</Text>
        </Flex>
      </Card>
    </Container>
  );
}
