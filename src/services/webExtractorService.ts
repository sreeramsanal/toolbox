import type { 
  ExtractedPageData, 
  HeadingItem, 
  LinkItem, 
  ImageItem, 
  SelectorMatch, 
  ExtractorStatus 
} from '../types/webExtractor';

const WEB_EXTRACTOR_CACHE_KEY = 'toolbox_web_extractor_last';

export class ExtractorError extends Error {
  status: ExtractorStatus;
  constructor(status: ExtractorStatus, message: string) {
    super(message);
    this.name = 'ExtractorError';
    this.status = status;
  }
}

/**
 * Validates a user-entered URL according to strict protocol and safety rules.
 * Only HTTP and HTTPS are permitted. Disallows javascript:, data:, file:, etc.
 */
export function validateUrl(rawUrl: string): { valid: boolean; normalized?: string; error?: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a URL to extract.' };
  }

  const lower = trimmed.toLowerCase();
  const disallowed = ['javascript:', 'data:', 'file:', 'chrome:', 'about:', 'blob:', 'view-source:', 'vbscript:'];
  if (disallowed.some((p) => lower.startsWith(p))) {
    return { valid: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  let parsed: URL;
  try {
    if (!/^https?:\/\//i.test(trimmed)) {
      // If user typed a hostname like example.com/article, prepend https://
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
        parsed = new URL(`https://${trimmed}`);
      } else {
        return { valid: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
      }
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    return { valid: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  return { valid: true, normalized: parsed.href };
}

/**
 * Resolves relative URLs to absolute against a base URL
 */
function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  try {
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return relativeOrAbsolute;
  }
}

/**
 * Parses markdown to extract headings when HTML headings are insufficient
 */
function extractHeadingsFromMarkdown(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim().replace(/\*\*|__|\*|_/g, ''),
      });
    }
  }
  return headings;
}

/**
 * Extracts links from markdown
 */
function extractLinksFromMarkdown(markdown: string, baseUrl: string): LinkItem[] {
  const links: LinkItem[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = regex.exec(markdown)) !== null) {
    const text = match[1].trim();
    const rawHref = match[2].trim();
    const resolved = resolveUrl(rawHref, baseUrl);
    if (text && !seen.has(resolved)) {
      seen.add(resolved);
      links.push({ text, url: resolved });
    }
  }
  return links;
}

/**
 * Extracts images from markdown
 */
function extractImagesFromMarkdown(markdown: string, baseUrl: string): ImageItem[] {
  const images: ImageItem[] = [];
  const regex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = regex.exec(markdown)) !== null) {
    const alt = match[1].trim() || 'Image';
    const rawSrc = match[2].trim();
    const resolved = resolveUrl(rawSrc, baseUrl);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      images.push({ alt, src: resolved });
    }
  }
  return images;
}

/**
 * Extracts webpage content directly from the browser using Jina Reader.
 * No custom backend or proxy is involved.
 */
export async function extractWebPage(targetUrl: string): Promise<ExtractedPageData> {
  const validation = validateUrl(targetUrl);
  if (!validation.valid || !validation.normalized) {
    throw new ExtractorError('invalid_url', validation.error || 'Please enter a valid HTTP or HTTPS URL.');
  }

  const normalized = validation.normalized;
  const readerEndpoint = `https://r.jina.ai/${normalized}`;

  // Call Jina Reader from browser
  let jsonRes: Response;
  let htmlText: string | undefined;

  try {
    const [jsonPromise, htmlPromise] = await Promise.allSettled([
      fetch(readerEndpoint, {
        headers: {
          Accept: 'application/json',
        },
      }),
      fetch(readerEndpoint, {
        headers: {
          'X-Respond-With': 'html',
        },
      }),
    ]);

    if (jsonPromise.status === 'rejected') {
      throw jsonPromise.reason;
    }
    jsonRes = jsonPromise.value;

    if (htmlPromise.status === 'fulfilled' && htmlPromise.value.ok) {
      htmlText = await htmlPromise.value.text();
    }
  } catch (err: unknown) {
    console.error('Extraction fetch error:', err);
    throw new ExtractorError('network_error', 'Unable to reach the extraction service.');
  }

  // Handle HTTP status codes from the reader service
  if (jsonRes.status === 429) {
    throw new ExtractorError('rate_limit', 'Too many requests. Please try again later.');
  }

  if (jsonRes.status === 403 || jsonRes.status === 422 || jsonRes.status === 451) {
    throw new ExtractorError(
      'blocked',
      'Unable to extract this webpage. The website or extraction service may not allow access.'
    );
  }

  if (!jsonRes.ok) {
    throw new ExtractorError(
      'network_error',
      `Unable to reach the extraction service (Status: ${jsonRes.status}).`
    );
  }

  let jsonData: any;
  try {
    jsonData = await jsonRes.json();
  } catch {
    throw new ExtractorError('empty_content', 'The webpage did not contain extractable content.');
  }

  if (jsonData.code === 429) {
    throw new ExtractorError('rate_limit', 'Too many requests. Please try again later.');
  }

  if (jsonData.code === 422 || jsonData.code === 403) {
    throw new ExtractorError(
      'blocked',
      jsonData.readableMessage || 'Unable to extract this webpage. The website or extraction service may not allow access.'
    );
  }

  const dataPayload = jsonData.data;
  if (!dataPayload || !dataPayload.content || dataPayload.content.trim().length === 0) {
    throw new ExtractorError('empty_content', 'The webpage did not contain extractable content.');
  }

  const content: string = dataPayload.content.trim();
  const rawTitle: string = dataPayload.title?.trim() || '';
  const rawDescription: string = dataPayload.description?.trim() || '';
  const urlObj = new URL(normalized);
  const domain = urlObj.hostname.replace(/^www\./, '');

  let title = rawTitle;
  let description = rawDescription;
  let canonicalUrl = dataPayload.url || normalized;
  const headings: HeadingItem[] = [];
  const links: LinkItem[] = [];
  const images: ImageItem[] = [];

  // Parse HTML inertly via browser DOMParser if available
  if (htmlText && typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      if (!title) {
        title = doc.querySelector('title')?.textContent?.trim() || '';
      }

      if (!description) {
        description = 
          doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
          '';
      }

      const canonicalLink = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
      if (canonicalLink) {
        canonicalUrl = resolveUrl(canonicalLink, normalized);
      }

      // Extract headings
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text) {
          const level = parseInt(el.tagName.replace('H', ''), 10) || 1;
          headings.push({ level, text });
        }
      });

      // Extract links
      const linkElements = doc.querySelectorAll('a[href]');
      const seenLinks = new Set<string>();
      linkElements.forEach((el) => {
        const href = el.getAttribute('href');
        const text = el.textContent?.trim() || href || '';
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          const resolved = resolveUrl(href, normalized);
          if (!seenLinks.has(resolved)) {
            seenLinks.add(resolved);
            links.push({ text, url: resolved });
          }
        }
      });

      // Extract images
      const imgElements = doc.querySelectorAll('img[src]');
      const seenImages = new Set<string>();
      imgElements.forEach((el) => {
        const src = el.getAttribute('src');
        const alt = el.getAttribute('alt')?.trim() || 'Extracted Image';
        if (src && !src.startsWith('data:image/svg+xml;base64,PHN2Zy')) { // skip tiny spacers
          const resolved = resolveUrl(src, normalized);
          if (!seenImages.has(resolved)) {
            seenImages.add(resolved);
            images.push({ alt, src: resolved });
          }
        }
      });
    } catch (e) {
      console.warn('DOMParser failed; falling back to markdown extraction:', e);
    }
  }

  // Fallback to markdown parsing if HTML parsing yielded empty collections
  if (headings.length === 0) {
    headings.push(...extractHeadingsFromMarkdown(content));
  }
  if (links.length === 0) {
    links.push(...extractLinksFromMarkdown(content, normalized));
  }
  if (images.length === 0) {
    images.push(...extractImagesFromMarkdown(content, normalized));
  }

  // Calculate local statistics
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = content.length;

  const result: ExtractedPageData = {
    url: normalized,
    domain,
    title: title || domain,
    description: description || 'No meta description detected on the page.',
    canonicalUrl: canonicalUrl !== normalized ? canonicalUrl : undefined,
    content,
    rawText: content,
    html: htmlText,
    fetchedAt: Date.now(),
    stats: {
      wordCount,
      charCount,
      headingCount: headings.length,
      linkCount: links.length,
      imageCount: images.length,
    },
    headings,
    links,
    images,
  };

  // Cache brief preview for the homepage card
  try {
    const summary = {
      domain,
      title: result.title,
      wordCount,
      fetchedAt: result.fetchedAt,
    };
    localStorage.setItem(WEB_EXTRACTOR_CACHE_KEY, JSON.stringify(summary));
  } catch (e) {
    console.warn('Failed to cache web extractor preview:', e);
  }

  return result;
}

/**
 * Executes a CSS selector extraction on safely parsed HTML in the browser.
 * Uses inert DOMParser and does NOT execute any scripts.
 */
export function extractCssSelector(html: string | undefined, selector: string): SelectorMatch[] {
  if (!html || !selector.trim() || typeof window === 'undefined' || !window.DOMParser) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Strip script and style tags from consideration
  doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());

  const matches = doc.querySelectorAll(selector.trim());
  const results: SelectorMatch[] = [];

  matches.forEach((el, index) => {
    const classes = el.className && typeof el.className === 'string'
      ? el.className.split(/\s+/).filter(Boolean)
      : undefined;

    // Build a clean, safe HTML snippet without evaluating it
    const outer = el.outerHTML;
    const snippet = outer.length > 350 ? outer.slice(0, 350) + '...' : outer;

    results.push({
      index: index + 1,
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: classes && classes.length > 0 ? classes : undefined,
      textContent: el.textContent?.trim() || '',
      snippet,
    });
  });

  return results;
}

/**
 * Returns the cached summary for the homepage live preview.
 */
export function getCachedWebExtraction(): { domain: string; title: string; wordCount: number; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(WEB_EXTRACTOR_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
