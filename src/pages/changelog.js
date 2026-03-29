import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from './_app';

export default function Changelog({ entries = [] }) {
  const { dark, toggle } = useTheme();

  return (
    <>
      <Head>
        <title>Changelog - Icon Font Generator</title>
      </Head>

      <div className="min-h-screen bg-[#f8fafc] transition-colors duration-300 dark:bg-[#0f1117]">
        {/* Header */}
        <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-[#0f1117]/80">
          <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to icons
            </Link>
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
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="mb-10 text-3xl font-bold text-gray-900 dark:text-white">Changelog</h1>

          <div className="space-y-10">
            {entries.map((entry) => (
              <div
                key={entry.version}
                className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gray-200 dark:before:bg-white/10"
              >
                {/* Version dot */}
                <div className="absolute left-0 top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/30" />
                </div>

                <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                  v{entry.version}
                </h2>
                <ul className="space-y-2">
                  {entry.changes.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const fs = await import('fs');
  const path = await import('path');

  let entries = [];
  try {
    const md = fs.readFileSync(path.join(process.cwd(), 'CHANGELOG.md'), 'utf8');
    const sections = md.split(/^## /m).filter(Boolean);

    entries = sections.map((section) => {
      const lines = section.trim().split('\n');
      const version = lines[0].trim();
      const changes = lines
        .slice(1)
        .map((l) => l.replace(/^- /, '').trim())
        .filter(Boolean);
      return { version, changes };
    });
  } catch (e) {
    // CHANGELOG.md not found
  }

  return { props: { entries } };
}
