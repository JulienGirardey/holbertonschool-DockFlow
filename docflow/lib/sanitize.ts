// @ts-ignore: missing type definitions for 'sanitize-html'
import sanitizeHtml from "sanitize-html";
import createDOMPurify, { WindowLike } from "dompurify";
import { JSDOM } from "jsdom";

// Server-side sanitizer (use for storage and server rendering)
export function sanitizeForStorage(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "h1", "h2", "h3", "pre", "code"
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"]
    },
    transformTags: {
      "a": sanitizeHtml.simpleTransform("a", { rel: "nofollow noreferrer noopener", target: "_blank" })
    },
    allowedSchemes: ["http", "https", "mailto"]
  });
}

// Client-side DOMPurify helper (for safe dangerouslySetInnerHTML)
export function getClientSanitizer() {
  // DOMPurify requires window; create only on client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMPurify = createDOMPurify(window as unknown as WindowLike);
  return DOMPurify.sanitize.bind(DOMPurify);
}

// For server-side use of DOMPurify (if needed)
export function getServerDomPurify() {
  const { window } = new JSDOM("");
  // @ts-ignore
  const DOMPurify = createDOMPurify(window as unknown as WindowLike);
  return DOMPurify.sanitize.bind(DOMPurify);
}