import { useEffect } from "react";

function upsertMetaDescription(content: string) {
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement("meta");
    description.setAttribute("name", "description");
    document.head.appendChild(description);
  }
  description.setAttribute("content", content);
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    upsertMetaDescription(description);
  }, [title, description]);
}
