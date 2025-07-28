import { load } from "cheerio";
import { fetch } from "bun";

export async function crawl(url: string) {
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(url, {
    redirect: "follow",
    signal: controller.signal,
    headers: {
      "User-Agent": "PranjalsCustomCrawler/0.1 (+https://example.com/bot)",
    },
  }).finally(() => clearTimeout(fetchTimeout));

  if (!res.ok || !res.headers.get("content-type")?.startsWith("text/html")) {
    throw new Error(`Non‑HTML response ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  const $ = load(html);

  // 1) Extract clean page text (strip <script>, <style>, etc.)
  $("script, style, noscript, iframe").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim(); // collapse whitespace

  // 2) Extract absolute URLs from <a href="">
  const outLinks = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")!;
    try {
      const abs = new URL(href, url).toString();
      if (abs.startsWith("http")) outLinks.add(abs.split("#")[0]);
    } catch (e) {
      console.error("Error crawling: ", e);
    }
  });

  return { text, links: [...outLinks], statusCode: res.status };
}
