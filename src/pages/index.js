import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { copyTextToClipboard, getHTML, getJSXTag, getJSX, downloadFile } from '@/utils';
import { toast } from 'react-toastify';
import { useTheme } from './_app';

export default function Page({ items = [], groups = {}, tags = {}, unicodes = {}, version = '' }) {
  const [search, setSearch] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [iconSize, setIconSize] = useState(28);
  const [viewMode, setViewMode] = useState('grid');
  const [activeGroup, setActiveGroup] = useState('all');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);
  const { dark, toggle } = useTheme();

  const groupNames = Object.keys(groups);
  const visibleItems = activeGroup === 'all' ? items : groups[activeGroup] || [];

  const filtered = visibleItems.filter((item) => {
    const name = item.replace('icon-font-', '');
    const q = search.toLowerCase();
    if (name.includes(q)) return true;
    const iconTags = tags[name] || [];
    return iconTags.some((t) => t.includes(q));
  });

  const copy = (text, label) => {
    copyTextToClipboard(text);
    toast.success(`Copied: ${label}`);
  };

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExportCSS = () => {
    window.open(`/fonts/${version}/icon-font.css`, '_blank');
    setShowExport(false);
  };

  const handleExportJSON = () => {
    const data = items.map((item) => {
      const name = item.replace('icon-font-', '');
      return { name, class: item, unicode: unicodes[item] || '' };
    });
    downloadFile(JSON.stringify(data, null, 2), 'icons.json');
    setShowExport(false);
  };

  const handleExportSVGSprite = () => {
    window.open(`/fonts/${version}/icon-font.symbol.svg`, '_blank');
    setShowExport(false);
  };

  return (
    <>
      <Head>
        <title>Icon Font Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#f8fafc] transition-colors duration-300 dark:bg-[#0f1117]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f1117]/80">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex h-16 items-center gap-5">
              <h1 className="shrink-0 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Icon<span className="text-primary">Font</span>
              </h1>

              {/* Search */}
              <div className="relative flex-1 max-w-lg">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search icons or tags..."
                  className="h-10 w-full rounded-xl bg-gray-100 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:bg-white/10 dark:focus:ring-primary/40"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-300 text-[10px] text-white transition hover:bg-gray-400 dark:bg-gray-600"
                  >
                    &#10005;
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="hidden items-center gap-4 lg:flex">
                {/* Size */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Size
                  </span>
                  <input
                    type="range"
                    min="16"
                    max="56"
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="w-5 text-center text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
                    {iconSize}
                  </span>
                </div>

                <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

                {/* View toggle */}
                <div className="flex overflow-hidden rounded-lg bg-gray-100 p-0.5 dark:bg-white/5">
                  {['grid', 'list'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                        viewMode === mode
                          ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

                {/* Export */}
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setShowExport(!showExport)}
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export
                  </button>
                  {showExport && (
                    <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-[#1a1b26]">
                      <DropdownItem onClick={handleExportCSS}>CSS File</DropdownItem>
                      <DropdownItem onClick={handleExportJSON}>JSON Manifest</DropdownItem>
                      <DropdownItem onClick={handleExportSVGSprite}>SVG Sprite</DropdownItem>
                    </div>
                  )}
                </div>

                <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />

                {/* Theme */}
                <button
                  onClick={toggle}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                >
                  {dark ? (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  ) : (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </button>

                {/* Changelog */}
                <Link
                  href="/changelog"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  title="Changelog"
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Link>
              </div>

              {/* Count */}
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-gray-500 dark:bg-white/5 dark:text-gray-400">
                {filtered.length} / {items.length}
              </span>
            </div>

            {/* Group tabs */}
            {groupNames.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-3 pt-1">
                <TabButton active={activeGroup === 'all'} onClick={() => setActiveGroup('all')}>
                  All
                </TabButton>
                {groupNames.map((g) => (
                  <TabButton key={g} active={activeGroup === g} onClick={() => setActiveGroup(g)}>
                    {g} <span className="ml-1 opacity-50">{groups[g].length}</span>
                  </TabButton>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-8">
          {viewMode === 'grid' && (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
            >
              {filtered.map((item, i) => {
                const name = item.replace('icon-font-', '');
                return (
                  <div
                    key={item}
                    className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-primary/30 dark:hover:bg-white/[0.04]"
                    onClick={() => setSelectedIcon(item)}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <i className={item} style={{ fontSize: iconSize }} aria-hidden="true" />
                    <span className="w-full truncate text-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      {name}
                    </span>
                    {hoveredIndex === i && (
                      <div className="absolute inset-0 flex flex-col gap-2 rounded-2xl bg-white/95 p-3 backdrop-blur-sm dark:bg-[#1a1b26]/95">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copy(getJSXTag(item), name);
                          }}
                          className="flex flex-1 items-center justify-center rounded-xl bg-gray-50 text-xs font-semibold text-gray-600 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-300 dark:hover:bg-primary"
                        >
                          Copy &lt;i&gt;
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copy(getJSX(item), name);
                          }}
                          className="flex flex-1 items-center justify-center rounded-xl bg-gray-50 text-xs font-semibold text-gray-600 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-300 dark:hover:bg-primary"
                        >
                          Copy JSX
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:border-white/5 dark:bg-white/[0.02]">
              {filtered.map((item, i) => {
                const name = item.replace('icon-font-', '');
                return (
                  <div
                    key={item}
                    onClick={() => setSelectedIcon(item)}
                    className={`flex cursor-pointer items-center gap-5 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                      i !== filtered.length - 1
                        ? 'border-b border-gray-100 dark:border-white/5'
                        : ''
                    }`}
                  >
                    <div className="flex w-10 items-center justify-center">
                      <i className={item} style={{ fontSize: iconSize }} aria-hidden="true" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(getJSXTag(item), name);
                        }}
                        className="rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-primary dark:hover:text-white"
                      >
                        &lt;i&gt;
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(getJSX(item), name);
                        }}
                        className="rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500 transition-all hover:bg-primary hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-primary dark:hover:text-white"
                      >
                        JSX
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-4 text-5xl opacity-20">&#128269;</div>
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                No icons found for &ldquo;{search}&rdquo;
              </p>
            </div>
          )}
        </main>

        {/* Icon Detail Modal */}
        {selectedIcon && (
          <IconModal
            item={selectedIcon}
            unicode={unicodes[selectedIcon]}
            tags={tags[selectedIcon.replace('icon-font-', '')]}
            groups={groups}
            onClose={() => setSelectedIcon(null)}
            onCopy={copy}
          />
        )}
      </div>
    </>
  );
}

/* ── Sub-components ── */

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
        active
          ? 'bg-primary text-white shadow-sm shadow-primary/25'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function DropdownItem({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
    >
      {children}
    </button>
  );
}

function IconModal({ item, unicode, tags, groups, onClose, onCopy }) {
  const name = item.replace('icon-font-', '');
  const capitalized = name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  // Find group
  const group = Object.entries(groups).find(([, icons]) => icons.includes(item));

  const codeSnippets = [
    { label: 'HTML', code: `<i class="${item}"></i>` },
    { label: 'JSX', code: `<i className="${item}"></i>` },
    { label: 'CSS Class', code: item },
    { label: 'Unicode', code: unicode || '—' },
    { label: 'Component', code: `import { ${capitalized} } from './icons';` }
  ];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1b26]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          &#10005;
        </button>

        {/* Preview */}
        <div className="flex flex-col items-center border-b border-gray-100 px-6 pb-6 pt-8 dark:border-white/5">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5">
            <i className={item} style={{ fontSize: 40 }} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{name}</h2>
          {group && (
            <span className="mt-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-primary">
              {group[0]}
            </span>
          )}
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Code snippets */}
        <div className="space-y-1 p-4">
          {codeSnippets.map(({ label, code }) => (
            <div
              key={label}
              onClick={() => onCopy(code, label)}
              className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {label}
              </span>
              <code className="max-w-[250px] truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                {code}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Data loading ── */

export async function getStaticProps() {
  const fs = await import('fs');
  const path = await import('path');
  const pkg = require('../../package.json');
  const iconsDir = path.join(process.cwd(), 'icons');
  const groups = {};
  const allItems = [];

  const entries = fs.readdirSync(iconsDir, { withFileTypes: true });

  const flatSvgs = entries
    .filter((e) => e.isFile() && e.name.endsWith('.svg'))
    .map((e) => e.name.replace('.svg', ''));
  if (flatSvgs.length > 0) {
    const items = flatSvgs.map((n) => `icon-font-${n}`).sort();
    groups['ungrouped'] = items;
    allItems.push(...items);
  }

  const dirs = entries.filter((e) => e.isDirectory());
  for (const dir of dirs) {
    const dirPath = path.join(iconsDir, dir.name);
    const svgs = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace('.svg', ''));
    if (svgs.length > 0) {
      const items = svgs.map((n) => `icon-font-${n}`).sort();
      groups[dir.name] = items;
      allItems.push(...items);
    }
  }

  // Load tags
  const tagsPath = path.join(iconsDir, 'tags.json');
  let tags = {};
  try {
    tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
  } catch (e) {
    // tags.json is optional
  }

  // Parse unicodes from generated CSS
  const unicodes = {};
  try {
    const css = fs.readFileSync(
      path.join(process.cwd(), `public/fonts/${pkg.version}/icon-font.css`),
      'utf8'
    );
    const re = /\.(icon-font-[^:]+):before\s*\{\s*content:\s*"\\([^"]+)"/g;
    let m;
    while ((m = re.exec(css)) !== null) {
      unicodes[m[1]] = `\\${m[2]}`;
    }
  } catch (e) {
    // font not generated yet
  }

  return {
    props: {
      items: allItems.sort(),
      groups: Object.keys(groups).length === 1 && groups['ungrouped'] ? {} : groups,
      tags,
      unicodes,
      version: pkg.version
    }
  };
}
