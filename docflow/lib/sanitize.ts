// @ts-expect-error: missing type definitions for 'sanitize-html'
import sanitizeHtml from "sanitize-html";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * Server-side sanitizer (for storage)
 */
export function sanitizeForStorage(dirty: string) {
	interface TransformTagResult {
		tagName: string;
		attribs: Record<string, string>;
	}

	type TransformTagFn = (tagName: string, attribs: Record<string, string>) => TransformTagResult;

	interface SanitizeOptions {
		allowedTags: string[];
		allowedAttributes: Record<string, string[]>;
		transformTags: Record<string, TransformTagFn>;
		allowedSchemes: string[];
	}

	const options: SanitizeOptions = {
		allowedTags: [
			"b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br",
			"h1", "h2", "h3", "pre", "code"
		],
		allowedAttributes: {
			a: ["href", "rel", "target"]
		},
		transformTags: {
			a: (tagName: string, attribs: Record<string, string>) => ({
				tagName: "a",
				attribs: {
					...attribs,
					rel: "nofollow noreferrer noopener",
					target: "_blank"
				}
			})
		},
		allowedSchemes: ["http", "https", "mailto"]
	};

	return sanitizeHtml(dirty, options);
}

/**
 * Client-side sanitizer factory (use in client components)
 * NOTE: DOMPurify requires a window/document; this returns a function only when run server-side via JSDOM
 */
export function getServerDomPurify() {
  const { window } = new JSDOM("");
  // createDOMPurify has proper types, cast the result to any to satisfy TS when using JSDOM window
  const DOMPurify = (createDOMPurify as unknown as (win: Window) => any)(window as unknown as Window);
  return (dirty: string) =>
	DOMPurify.sanitize(dirty, {
	  ALLOWED_TAGS: ["b","i","em","strong","a","p","ul","ol","li","br","h1","h2","h3","pre","code"],
	  ALLOWED_ATTR: ["href","target","rel"]
	});
}