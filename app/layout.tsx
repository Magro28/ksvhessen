import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "KSV Hessen Kassel — Die Löwen sind zurück",
  description: "News, Spiele, Mannschaften und Löwenradio des KSV Hessen Kassel.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathScript = `(() => {
    const base = ${JSON.stringify(basePath)};
    if (!base) return;
    const rewrite = (value) => {
      if (!value || !value.startsWith("/") || value.startsWith(base + "/") || value.startsWith("//")) return value;
      const route = value.match(new RegExp("^/(mannschaften|spiele|verein)$"));
      return route ? base + value + "/" : base + value;
    };
    const update = () => document.querySelectorAll('a[href^="/"], img[src^="/"], link[href^="/"]').forEach((element) => {
      const attribute = element.tagName === "IMG" ? "src" : "href";
      const value = element.getAttribute(attribute);
      const next = rewrite(value);
      if (next !== value) element.setAttribute(attribute, next);
    });
    update();
    document.addEventListener("DOMContentLoaded", update);
    new MutationObserver(update).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="/"]');
      if (link) link.setAttribute("href", rewrite(link.getAttribute("href")));
    }, true);
  })();`;

  return <html lang="de"><head><script dangerouslySetInnerHTML={{ __html: pathScript }} /></head><body>{children}</body></html>;
}
