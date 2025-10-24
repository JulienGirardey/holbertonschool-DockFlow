'use client'
import React from "react";
import DOMPurify from "dompurify";

export default function SafeHtml({ html }: { html?: string }) {
  if (!html) return null;
  // sanitize on client prior to injection
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b","i","em","strong","a","p","ul","ol","li","br","h1","h2","h3","pre","code"],
    ALLOWED_ATTR: ["href","target","rel"]
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}