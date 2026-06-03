import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

const messagesCache = new Map<
  string,
  {
    mtimeMs: number;
    messages: Messages;
  }
>();

async function resolveMessagesPath(locale: string) {
  const candidates = [
    path.join(process.cwd(), "messages", `${locale}.json`),
    path.join(process.cwd(), "apps", "web", "messages", `${locale}.json`),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Messages file not found for locale "${locale}"`);
}

async function loadMessages(locale: string) {
  const messagesPath = await resolveMessagesPath(locale);
  const { mtimeMs } = await stat(messagesPath);
  const isDev = process.env.NODE_ENV === "development";
  const cached = messagesCache.get(locale);

  if (!isDev && cached?.mtimeMs === mtimeMs) {
    return cached.messages;
  }

  const messages = JSON.parse(
    (await readFile(messagesPath, "utf8")).replace(/^\uFEFF/, ""),
  ) as Messages;

  messagesCache.set(locale, {
    mtimeMs,
    messages,
  });

  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "pt")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
