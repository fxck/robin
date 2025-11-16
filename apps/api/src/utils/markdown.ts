/**
 * Strip markdown syntax from text and return plain text
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove markdown headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (**text** or __text__ or *text* or _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
    // Remove list markers (-, *, +, 1.)
    .replace(/^[\s-]*[\*\-\+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove extra whitespace and newlines
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate excerpt from content by stripping markdown and truncating
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = stripMarkdown(content);
  return plainText.length > maxLength
    ? `${plainText.substring(0, maxLength).trim()}...`
    : plainText;
}
