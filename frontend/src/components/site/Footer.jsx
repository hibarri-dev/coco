import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

const COLUMNS = [
  { title: 'Product', links: [['Features', '/#features'], ['GPU Cloud', '/#features'], ['Pricing', '/#pricing'], ['Templates', '/#features'], ['Changelog', '/#featured']] },
  { title: 'Developers', links: [['Documentation', '/#features'], ['API reference', '/#features'], ['CLI', '/#features'], ['Status', '/#stats'], ['Community', '/#testimonials']] },
  { title: 'Partners', links: [['Cloud Partners', '/investors'], ['Partner dashboard', '/dashboard'], ['Server packages', '/packages'], ['Free broadcast', '/live'], ['Affiliate program', '/#partners']] },
  { title: 'Company', links: [['About', '/#cta'], ['Careers', '/#cta'], ['Blog', '/#featured'], ['Contact', 'mailto:hello@hibarri.com']] },
  { title: 'Legal', links: [['Privacy policy', '#'], ['Terms of service', '#'], ['DPA', '#'], ['Acceptable use', '#'], ['SLA', '#']] },
];

function FooterLink({ href, children }) {
  const cls = 'text-[14px] text-white/50 hover:text-white transition-colors';
  if (href.startsWith('/') && !href.includes('#')) {
    return <Link to={href} className={cls}>{children}</Link>;
  }
  return <a href={href} className={cls}>{children}</a>;
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060509]">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Link to="/" className="inline-block text-white" aria-label="CoCo home">
              <Logo className="h-12 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/45">
              The AI NeoCloud for developers, powered by a network of partner-owned servers.
            </p>
            <a href="#" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-white/60 hover:text-white hover:border-white/20 transition">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> All systems operational
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[13px] font-semibold text-white">{col.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}><FooterLink href={href}>{label}</FooterLink></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-[13px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Hibarri. All rights reserved.</span>
          <span>coco.hibarri.com</span>
        </div>
      </div>
    </footer>
  );
}
