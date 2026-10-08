import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Heading as HeadingIcon, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Code, 
  Layers, 
  Sparkles
} from 'lucide-react';
import type { 
  ExtractedPageData, 
  ExtractorStatus, 
  SelectorMatch 
} from '../types/webExtractor';
import { 
  extractWebPage, 
  extractCssSelector, 
  validateUrl, 
  ExtractorError 
} from '../services/webExtractorService';
import { SafeMarkdownRenderer } from '../components/SafeMarkdownRenderer';
import { playClickSound } from '../utils/sound';

type ActiveTab = 'CONTENT' | 'HEADINGS' | 'LINKS' | 'IMAGES' | 'RAW';

export const WebExtractorPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState<ExtractorStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<ExtractedPageData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('CONTENT');

  // Copy feedback state
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  // Link search filter
  const [linkSearch, setLinkSearch] = useState('');

  // CSS Selector state
  const [cssSelector, setCssSelector] = useState('');
  const [selectorMatches, setSelectorMatches] = useState<SelectorMatch[] | null>(null);
  const [selectorError, setSelectorError] = useState<string | null>(null);

  const showCopiedFeedback = (key: string) => {
    setCopiedAction(key);
    playClickSound();
    setTimeout(() => {
      setCopiedAction((current) => (current === key ? null : current));
    }, 2000);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopiedFeedback(key);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleExtract = async (targetUrl?: string) => {
    const rawToExtract = targetUrl || urlInput;
    if (!rawToExtract.trim()) {
      setStatus('invalid_url');
      setErrorMessage('Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    const validation = validateUrl(rawToExtract);
    if (!validation.valid || !validation.normalized) {
      setStatus('invalid_url');
      setErrorMessage(validation.error || 'Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    playClickSound();
    setStatus('loading');
    setErrorMessage('');
    setData(null);
    setSelectorMatches(null);
    setSelectorError(null);

    try {
      const extracted = await extractWebPage(validation.normalized);
      setData(extracted);
      setStatus('success');
      setActiveTab('CONTENT');
    } catch (err: unknown) {
      if (err instanceof ExtractorError) {
        setStatus(err.status);
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setStatus('network_error');
        setErrorMessage(err.message || 'Unable to reach the extraction service.');
      } else {
        setStatus('network_error');
        setErrorMessage('Unable to reach the extraction service.');
      }
    }
  };

  const handleSelectorExtract = () => {
    if (!data?.html) {
      setSelectorError('HTML source is not available for this extraction.');
      return;
    }
    if (!cssSelector.trim()) {
      setSelectorError('Please enter a CSS selector.');
      return;
    }

    playClickSound();
    setSelectorError(null);
    try {
      const matches = extractCssSelector(data.html, cssSelector);
      setSelectorMatches(matches);
      if (matches.length === 0) {
        setSelectorError(`No elements matched "${cssSelector}".`);
      }
    } catch {
      setSelectorError('Invalid CSS selector syntax.');
    }
  };

  const handleDownloadJson = () => {
    if (!data) return;
    playClickSound();
    const exportData = {
      url: data.url,
      domain: data.domain,
      title: data.title,
      description: data.description,
      canonicalUrl: data.canonicalUrl,
      extractedAt: new Date(data.fetchedAt).toISOString(),
      stats: data.stats,
      headings: data.headings,
      links: data.links,
      images: data.images,
      content: data.content,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-extract-${data.domain}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCopiedFeedback('download');
  };

  const filteredLinks = data?.links.filter((link) => {
    if (!linkSearch) return true;
    const q = linkSearch.toLowerCase();
    return link.text.toLowerCase().includes(q) || link.url.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-emerald mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
            WEB UTILITY • ONE URL AT A TIME
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Web Extractor</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Extract useful information from any public webpage.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-dark-text-secondary bg-dark-surface1 px-3 py-1.5 rounded-lg border border-dark-border">
          <Globe className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Article & Content Extractor</span>
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dark-surface1 border border-dark-border shadow-lg mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExtract();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1 flex items-center bg-dark-surface2 rounded-xl border border-dark-border focus-within:border-brand-emerald transition-colors">
            <span className="pl-3.5 text-dark-text-muted">
              <Globe className="w-4 h-4 text-brand-emerald" />
            </span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-transparent text-dark-text placeholder:text-dark-text-muted px-3 py-3 text-sm font-mono focus:outline-none"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="pr-3 text-xs text-dark-text-muted hover:text-dark-text font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-dark-bg font-semibold text-sm transition disabled:opacity-50 shadow-sm"
          >
            {status === 'loading' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Status Banners */}
      {status === 'loading' && (
        <div className="p-8 my-6 text-center rounded-2xl bg-dark-surface1 border border-dark-border">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-emerald mx-auto mb-3" />
          <h3 className="text-base font-bold text-dark-text mb-1">Extracting Webpage Content</h3>
          <p className="text-xs font-mono text-dark-text-muted max-w-md mx-auto">
            Fetching page and extracting headings, links, images, and text metrics...
          </p>
        </div>
      )}

      {status === 'invalid_url' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || 'Please enter a valid HTTP or HTTPS URL.'}</span>
        </div>
      )}

      {status === 'network_error' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || 'Unable to reach the extraction service.'}</span>
        </div>
      )}

      {status === 'blocked' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || 'Unable to extract this webpage. The website or extraction service may not allow access.'}</span>
        </div>
      )}

      {status === 'rate_limit' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || 'Too many requests. Please try again later.'}</span>
        </div>
      )}

      {status === 'empty_content' && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || 'The webpage did not contain extractable content.'}</span>
        </div>
      )}

      {/* Initial idle state */}
      {status === 'idle' && (
        <div className="p-12 text-center rounded-2xl bg-dark-surface1 border border-dark-border mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center mx-auto mb-4 text-brand-emerald">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-dark-text mb-1">Enter a URL to extract webpage content.</h2>
          <p className="text-xs text-dark-text-muted max-w-md mx-auto mb-6">
            Extract clean markdown articles, headings, links, images, and inspect elements with CSS selectors.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-dark-surface2/60 border border-dark-border">
              <div className="text-[10px] font-mono text-brand-emerald uppercase mb-1">01 • ONE URL</div>
              <div className="text-xs font-semibold text-dark-text mb-1">Direct Target</div>
              <div className="text-[11px] text-dark-text-muted">Extract any public webpage with one click.</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-surface2/60 border border-dark-border">
              <div className="text-[10px] font-mono text-brand-cyan uppercase mb-1">02 • CLEAN CONTENT</div>
              <div className="text-xs font-semibold text-dark-text mb-1">Readable Articles</div>
              <div className="text-[11px] text-dark-text-muted">Structured text, headings, links, and media.</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-surface2/60 border border-dark-border">
              <div className="text-[10px] font-mono text-brand-indigo uppercase mb-1">03 • EASY EXPORT</div>
              <div className="text-xs font-semibold text-dark-text mb-1">Quick Exports</div>
              <div className="text-[11px] text-dark-text-muted">Download JSON, copy markdown, or run CSS queries.</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Results View */}
      {status === 'success' && data && (
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-dark-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-dark-text-muted">
                  <span className="px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald font-semibold uppercase text-[10px] border border-brand-emerald/20">
                    {data.domain}
                  </span>
                  <span>•</span>
                  <span>Extracted {new Date(data.fetchedAt).toLocaleTimeString()}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-dark-text leading-tight">
                  {data.title}
                </h2>
                {data.description && (
                  <p className="text-xs text-dark-text-secondary max-w-3xl leading-relaxed pt-1">
                    {data.description}
                  </p>
                )}
                {data.canonicalUrl && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-dark-text-muted">
                    <span>Canonical:</span>
                    <a
                      href={data.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-indigo hover:underline truncate max-w-md flex items-center gap-1"
                    >
                      <span>{data.canonicalUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.content, 'copy_md')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 hover:bg-dark-surface3 text-dark-text-secondary text-xs font-mono transition"
                >
                  {copiedAction === 'copy_md' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAction === 'copy_md' ? 'Copied' : 'Copy Markdown'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(data.rawText, 'copy_txt')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 hover:bg-dark-surface3 text-dark-text-secondary text-xs font-mono transition"
                >
                  {copiedAction === 'copy_txt' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAction === 'copy_txt' ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'copy_json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 hover:bg-dark-surface3 text-dark-text-secondary text-xs font-mono transition"
                >
                  {copiedAction === 'copy_json' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAction === 'copy_json' ? 'Copied' : 'Copy JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-emerald/30 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald text-xs font-mono font-medium transition"
                >
                  {copiedAction === 'download' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{copiedAction === 'download' ? 'Downloaded' : 'Download JSON'}</span>
                </button>
              </div>
            </div>

            {/* Content Statistics Cards (5 items) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
              <div className="p-3.5 rounded-xl bg-dark-surface2/60 border border-dark-border">
                <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">WORD COUNT</div>
                <div className="text-xl font-mono font-bold text-dark-text">
                  {data.stats.wordCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-surface2/60 border border-dark-border">
                <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">CHARACTERS</div>
                <div className="text-xl font-mono font-bold text-brand-cyan">
                  {data.stats.charCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-surface2/60 border border-dark-border">
                <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">HEADINGS</div>
                <div className="text-xl font-mono font-bold text-brand-purple">
                  {data.stats.headingCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-surface2/60 border border-dark-border">
                <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">LINKS</div>
                <div className="text-xl font-mono font-bold text-brand-indigo">
                  {data.stats.linkCount}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-dark-surface2/60 border border-dark-border">
                <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1">IMAGES</div>
                <div className="text-xl font-mono font-bold text-brand-emerald">
                  {data.stats.imageCount}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Extraction: CSS Selector */}
          <div className="p-5 rounded-2xl bg-dark-surface1 border border-dark-border shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-dark-text flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-cyan" />
                  <span>Advanced Extraction</span>
                </h3>
                <p className="text-xs text-dark-text-muted">
                  Extract matching elements using a CSS selector (e.g., <code className="text-brand-cyan font-mono">.product-title</code> or <code className="text-brand-cyan font-mono">h2, p</code>).
                </p>
              </div>

              {selectorMatches && selectorMatches.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        selectorMatches.map((m) => m.textContent).join('\n\n'),
                        'selector_copy_all'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 text-dark-text-secondary text-xs font-mono hover:text-dark-text transition"
                  >
                    {copiedAction === 'selector_copy_all' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(selectorMatches, null, 2),
                        'selector_copy_json'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 text-dark-text-secondary text-xs font-mono hover:text-dark-text transition"
                  >
                    {copiedAction === 'selector_copy_json' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy JSON</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={cssSelector}
                onChange={(e) => setCssSelector(e.target.value)}
                placeholder="CSS Selector (e.g. h2, article p, .storylink)"
                className="flex-1 bg-dark-surface2 text-dark-text placeholder:text-dark-text-muted px-3 py-2 rounded-lg border border-dark-border text-xs font-mono focus:border-brand-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSelectorExtract}
                className="px-4 py-2 rounded-lg bg-dark-surface3 hover:bg-dark-surface3/80 text-dark-text text-xs font-mono font-semibold transition border border-dark-border"
              >
                Extract Elements
              </button>
            </div>

            {selectorError && (
              <div className="mt-3 text-xs text-amber-400 font-mono">
                {selectorError}
              </div>
            )}

            {selectorMatches && selectorMatches.length > 0 && (
              <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                <div className="text-[11px] font-mono text-dark-text-muted">
                  MATCHES FOUND: {selectorMatches.length}
                </div>
                {selectorMatches.map((m) => (
                  <div
                    key={m.index}
                    className="p-3 rounded-xl bg-dark-surface2/70 border border-dark-border text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-dark-text-muted mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-cyan">
                          Element {String(m.index).padStart(2, '0')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-dark-surface1 text-[10px] border border-dark-border">
                          &lt;{m.tag}&gt;
                        </span>
                        {m.classes && (
                          <span className="text-[10px] text-dark-text-muted truncate max-w-xs">
                            .{m.classes.join('.')}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(m.textContent, `sel_${m.index}`)}
                        className="text-[10px] text-dark-text-muted hover:text-dark-text flex items-center gap-1"
                      >
                        {copiedAction === `sel_${m.index}` ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="text-dark-text font-sans text-xs mb-1.5 line-clamp-3">
                      {m.textContent || <span className="italic text-dark-text-muted">No text content</span>}
                    </div>

                    <pre className="text-[10px] text-dark-text-muted bg-dark-surface1 p-2 rounded overflow-x-auto border border-dark-border">
                      <code>{m.snippet}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Tabs Navigation */}
          <div className="border-b border-dark-border flex items-center gap-1 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('CONTENT');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'CONTENT'
                  ? 'border-brand-emerald text-brand-emerald bg-dark-surface1'
                  : 'border-transparent text-dark-text-muted hover:text-dark-text'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CONTENT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('HEADINGS');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'HEADINGS'
                  ? 'border-brand-purple text-brand-purple bg-dark-surface1'
                  : 'border-transparent text-dark-text-muted hover:text-dark-text'
              }`}
            >
              <HeadingIcon className="w-3.5 h-3.5" />
              <span>HEADINGS ({data.headings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('LINKS');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'LINKS'
                  ? 'border-brand-indigo text-brand-indigo bg-dark-surface1'
                  : 'border-transparent text-dark-text-muted hover:text-dark-text'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>LINKS ({data.links.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('IMAGES');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'IMAGES'
                  ? 'border-brand-cyan text-brand-cyan bg-dark-surface1'
                  : 'border-transparent text-dark-text-muted hover:text-dark-text'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>IMAGES ({data.images.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('RAW');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition border-b-2 ${
                activeTab === 'RAW'
                  ? 'border-brand-amber text-brand-amber bg-dark-surface1'
                  : 'border-transparent text-dark-text-muted hover:text-dark-text'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>RAW</span>
            </button>
          </div>

          {/* Tab 1: CONTENT */}
          {activeTab === 'CONTENT' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl">
              <SafeMarkdownRenderer content={data.content} />
            </div>
          )}

          {/* Tab 2: HEADINGS */}
          {activeTab === 'HEADINGS' && (
            <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-3">
              <div className="text-xs font-mono text-dark-text-muted pb-2 border-b border-dark-border">
                DETECTED DOCUMENT HEADINGS ({data.headings.length})
              </div>
              {data.headings.length === 0 ? (
                <div className="text-xs font-mono text-dark-text-muted py-8 text-center">
                  No headings were detected in this document.
                </div>
              ) : (
                data.headings.map((h, idx) => (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${Math.max(0, (h.level - 1) * 1.5)}rem` }}
                    className="flex items-center justify-between gap-3 py-2 border-b border-dark-border/40 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        h.level === 1 ? 'bg-brand-purple/20 text-brand-purple' :
                        h.level === 2 ? 'bg-brand-indigo/20 text-brand-indigo' :
                        h.level === 3 ? 'bg-brand-cyan/20 text-brand-cyan' :
                        'bg-dark-surface2 text-dark-text-muted'
                      }`}>
                        H{h.level}
                      </span>
                      <span className="text-sm font-medium text-dark-text truncate">
                        {h.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(h.text, `heading_${idx}`)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-dark-text-muted hover:text-dark-text transition"
                      title="Copy heading text"
                    >
                      {copiedAction === `heading_${idx}` ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: LINKS */}
          {activeTab === 'LINKS' && (
            <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-border">
                <div className="text-xs font-mono text-dark-text-muted">
                  EXTRACTED LINKS ({filteredLinks.length} of {data.links.length})
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    placeholder="Filter links..."
                    className="bg-dark-surface2 text-dark-text placeholder:text-dark-text-muted px-3 py-1.5 rounded-lg border border-dark-border text-xs font-mono focus:outline-none focus:border-brand-indigo"
                  />
                </div>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="text-xs font-mono text-dark-text-muted py-8 text-center">
                  No links matching your filter.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-dark-surface2/60 border border-dark-border flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-dark-text truncate">
                          {link.text || <span className="italic text-dark-text-muted">No anchor text</span>}
                        </div>
                        <div className="text-[11px] font-mono text-brand-indigo truncate">
                          {link.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(link.url, `link_${idx}`)}
                          className="p-1.5 rounded-lg bg-dark-surface1 border border-dark-border text-dark-text-muted hover:text-dark-text transition"
                          title="Copy link URL"
                        >
                          {copiedAction === `link_${idx}` ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-dark-surface1 border border-dark-border text-dark-text-muted hover:text-dark-text transition"
                          title="Open link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: IMAGES */}
          {activeTab === 'IMAGES' && (
            <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-4">
              <div className="text-xs font-mono text-dark-text-muted pb-3 border-b border-dark-border">
                EXTRACTED IMAGES ({data.images.length})
              </div>

              {data.images.length === 0 ? (
                <div className="text-xs font-mono text-dark-text-muted py-8 text-center">
                  No image tags or markdown images were detected on this page.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-dark-surface2/60 border border-dark-border flex flex-col justify-between overflow-hidden"
                    >
                      <div className="aspect-video w-full rounded-lg bg-dark-surface1 border border-dark-border flex items-center justify-center overflow-hidden mb-2 relative group">
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="text-[11px] font-medium text-dark-text truncate mb-1" title={img.alt}>
                        {img.alt || 'Untitled Image'}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-dark-border/40 text-[10px] font-mono text-dark-text-muted">
                        <span className="truncate max-w-[180px]">{img.src}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(img.src, `img_${idx}`)}
                            className="p-1 rounded bg-dark-surface1 border border-dark-border hover:text-dark-text"
                            title="Copy image URL"
                          >
                            {copiedAction === `img_${idx}` ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <a
                            href={img.src}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-dark-surface1 border border-dark-border hover:text-dark-text"
                            title="Open original image"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: RAW */}
          {activeTab === 'RAW' && (
            <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                <span className="text-xs font-mono text-dark-text-muted">
                  RAW EXTRACTED MARKDOWN BUFFER ({data.content.length} chars)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.content, 'raw_copy')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface2 text-dark-text-secondary text-xs font-mono hover:text-dark-text transition"
                >
                  {copiedAction === 'raw_copy' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAction === 'raw_copy' ? 'Copied' : 'Copy Raw'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-dark-surface2 text-xs font-mono text-dark-text overflow-x-auto max-h-[500px] leading-relaxed border border-dark-border">
                <code>{data.content}</code>
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
