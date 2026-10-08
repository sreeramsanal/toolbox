import React from 'react';

interface SafeMarkdownRendererProps {
  content: string;
}

/**
 * Safely parses inline markdown elements:
 * bold, italic, code, links, images.
 * Pure React elements without dangerouslySetInnerHTML.
 */
function renderInlineContent(text: string): React.ReactNode[] {
  // Regex to match inline tokens:
  // 1: image ![alt](url)
  // 2: link [text](url)
  // 3: bold **text** or __text__
  // 4: italic *text* or _text_
  // 5: inline code `code`
  const tokenRegex = /(!?\[([^\]]*)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*]+)\*|_([^_]+)_)|(`([^`]+)`)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith('![')) {
      // Image: ![alt](url)
      const alt = match[2];
      const src = match[3];
      elements.push(
        <span key={`img-${match.index}`} className="my-2 block max-w-full">
          <img
            src={src}
            alt={alt || 'Webpage content'}
            loading="lazy"
            className="max-h-96 rounded-lg border border-dark-border object-contain mx-auto"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          {alt && <span className="block text-center text-[11px] font-mono text-dark-text-muted mt-1">{alt}</span>}
        </span>
      );
    } else if (fullMatch.startsWith('[')) {
      // Link: [text](url)
      const linkText = match[2];
      const linkUrl = match[3];
      elements.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-brand-indigo hover:underline font-medium"
        >
          {linkText || linkUrl}
        </a>
      );
    } else if (match[4]) {
      // Bold: **text** or __text__
      const boldText = match[5] || match[6];
      elements.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-dark-text">
          {boldText}
        </strong>
      );
    } else if (match[7]) {
      // Italic: *text* or _text_
      const italicText = match[8] || match[9];
      elements.push(
        <em key={`italic-${match.index}`} className="italic">
          {italicText}
        </em>
      );
    } else if (match[10]) {
      // Inline code: `code`
      const codeText = match[11];
      elements.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-dark-surface2 border border-dark-border font-mono text-xs text-brand-cyan"
        >
          {codeText}
        </code>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

export const SafeMarkdownRenderer: React.FC<SafeMarkdownRendererProps> = ({ content }) => {
  if (!content) {
    return <div className="text-dark-text-muted text-sm italic">No content available to display.</div>;
  }

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let inList = false;
  let listItems: string[] = [];
  let isOrderedList = false;

  const flushList = (keyIndex: number) => {
    if (inList && listItems.length > 0) {
      if (isOrderedList) {
        blocks.push(
          <ol key={`ol-${keyIndex}`} className="list-decimal pl-6 my-3 space-y-1 text-sm text-dark-text-secondary">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineContent(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`ul-${keyIndex}`} className="list-disc pl-6 my-3 space-y-1 text-sm text-dark-text-secondary">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineContent(item)}
              </li>
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    // Check code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <div key={`code-block-${i}`} className="my-4 rounded-xl overflow-hidden border border-dark-border bg-dark-surface1">
            {codeLang && (
              <div className="px-4 py-1.5 bg-dark-surface2/60 border-b border-dark-border text-[11px] font-mono text-dark-text-muted uppercase">
                {codeLang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-xs font-mono text-dark-text leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        // Start code block
        flushList(i);
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // Empty lines flush active lists
    if (!trimmed) {
      flushList(i);
      return;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList(i);
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-dark-border" />);
      return;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList(i);
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const parsedText = renderInlineContent(text);

      if (level === 1) {
        blocks.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold text-dark-text mt-8 mb-4 border-b border-dark-border pb-2">
            {parsedText}
          </h1>
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-dark-text mt-6 mb-3">
            {parsedText}
          </h2>
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-lg font-semibold text-dark-text mt-5 mb-2">
            {parsedText}
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={`h4-${i}`} className="text-base font-semibold text-dark-text mt-4 mb-2">
            {parsedText}
          </h4>
        );
      }
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      flushList(i);
      const quoteText = trimmed.replace(/^>\s*/, '');
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 border-l-4 border-brand-indigo bg-brand-indigo/5 py-2 pr-3 rounded-r text-sm text-dark-text-secondary italic"
        >
          {renderInlineContent(quoteText)}
        </blockquote>
      );
      return;
    }

    // Unordered lists (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || isOrderedList) {
        flushList(i);
        inList = true;
        isOrderedList = false;
      }
      listItems.push(ulMatch[1]);
      return;
    }

    // Ordered lists (1. or 2.)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || !isOrderedList) {
        flushList(i);
        inList = true;
        isOrderedList = true;
      }
      listItems.push(olMatch[1]);
      return;
    }

    // Standard paragraph
    flushList(i);
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-sm leading-relaxed text-dark-text-secondary">
        {renderInlineContent(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="space-y-1">{blocks}</div>;
};
