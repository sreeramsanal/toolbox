export interface HeadingItem {
  level: number;
  text: string;
}

export interface LinkItem {
  text: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  src: string;
}

export interface PageStats {
  wordCount: number;
  charCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
}

export interface ExtractedPageData {
  url: string;
  domain: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  content: string; // readable markdown
  rawText: string;
  html?: string;
  fetchedAt: number;
  stats: PageStats;
  headings: HeadingItem[];
  links: LinkItem[];
  images: ImageItem[];
}

export interface SelectorMatch {
  index: number;
  tag: string;
  id?: string;
  classes?: string[];
  textContent: string;
  snippet: string;
}

export type ExtractorStatus = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'invalid_url' 
  | 'network_error' 
  | 'blocked' 
  | 'rate_limit' 
  | 'empty_content';
