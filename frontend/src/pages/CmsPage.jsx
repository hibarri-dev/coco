import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/site/Navbar';
import Footer from '../components/site/Footer';
import { API_URL } from '../config/funnel';
import { cleanHtml } from '../lib/cleanHtml';

// Tailwind preflight strips heading/list/link styles; restore them for Quill output.
const RICH_TEXT_CLASS =
  'text-[16px] leading-relaxed text-white/75 break-words [&_a]:font-medium [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_table]:w-full [&_td]:border [&_td]:border-white/10 [&_td]:p-2 [&>*+*]:mt-4';

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

/* Public page authored in Hibarri Superadmin > Coco > Pages, served at /page/:slug. */
export default function CmsPage() {
  const { theme } = useTheme();
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    if (!API_URL) {
      setState('missing');
      return undefined;
    }
    fetch(`${API_URL}/pages/${encodeURIComponent(slug)}?site=coco`, { credentials: 'omit' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not found'))))
      .then(({ page: data }) => {
        if (cancelled) return;
        setPage(data);
        setState('ready');
        document.title = `${data.title} | CoCo by Hibarri`;
        if (data.metaDescription) {
          document.querySelector('meta[name="description"]')?.setAttribute('content', data.metaDescription);
        }
      })
      .catch(() => {
        if (!cancelled) setState('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const published = formatDate(page?.publishedAt || page?.createdAt);

  return (
    <div data-theme={theme} className="site-theme min-h-screen bg-[#0b0a10] text-white transition-colors duration-500">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
        {state === 'loading' && (
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-10 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-white/10" />
          </div>
        )}

        {state === 'missing' && (
          <div className="py-16 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
            <p className="mt-3 text-white/60">This page doesn&apos;t exist or isn&apos;t published yet.</p>
            <Link to="/" className="mt-8 inline-block rounded-xl bg-coco-purple px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#ad1fff]">
              Back to home
            </Link>
          </div>
        )}

        {state === 'ready' && page && (
          <article>
            {page.category?.name && (
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-coco-violet">{page.category.name}</p>
            )}
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{page.title}</h1>
            {page.excerpt && <p className="mt-5 text-lg leading-relaxed text-white/70">{page.excerpt}</p>}
            {published && <p className="mt-4 text-[13px] text-white/45">{published}</p>}

            <div className="mt-10 space-y-8">
              {page.featuredImageUrl && (
                <img src={page.featuredImageUrl} alt={page.title} className="max-h-[480px] w-full rounded-2xl border border-white/10 object-cover" />
              )}
              {page.content?.map((block, index) =>
                block.type === 'image' ? (
                  block.value ? <img key={index} src={block.value} alt="" className="w-full rounded-2xl border border-white/10" /> : null
                ) : (
                  <div key={index} className={RICH_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: cleanHtml(block.value) }} />
                ),
              )}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
