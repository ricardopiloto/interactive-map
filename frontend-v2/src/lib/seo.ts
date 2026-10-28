import { useLayoutEffect } from "react";

export interface SeoOptions {
  title: string;
  description: string;
  canonical?: string | undefined;
  robots: string;
}

type ManagedElement = {
  element: HTMLElement;
  created: boolean;
  previous: string | null;
  marked: boolean;
};

function setHeadElement(
  selector: string,
  tag: "meta" | "link",
  attribute: string,
  value: string,
): ManagedElement {
  let element = document.head.querySelector<HTMLElement>(selector);
  const created = !element;
  if (!element) {
    element = document.createElement(tag);
    if (tag === "meta")
      element.setAttribute("name", selector.includes("description") ? "description" : "robots");
    else element.setAttribute("rel", "canonical");
    element.setAttribute("data-seo", "");
    document.head.appendChild(element);
  }
  const previous = element.getAttribute(attribute);
  const marked = element.hasAttribute("data-seo");
  element.setAttribute("data-seo", "");
  element.setAttribute(attribute, value);
  return { element, created, previous, marked };
}

export function useSeo(options: SeoOptions | null): void {
  const title = options?.title;
  const description = options?.description;
  const canonical = options?.canonical;
  const robots = options?.robots;

  useLayoutEffect(() => {
    if (!title || !description || !robots) return;
    const previousTitle = document.title;
    document.title = title;
    const elements = [
      setHeadElement('meta[name="description"]', "meta", "content", description),
      setHeadElement('meta[name="robots"]', "meta", "content", robots),
    ];
    if (canonical) {
      elements.push(setHeadElement('link[rel="canonical"]', "link", "href", canonical));
    } else {
      document.head.querySelector('link[rel="canonical"][data-seo]')?.remove();
    }
    return () => {
      document.title = previousTitle;
      for (const { element, created, previous, marked } of elements) {
        if (created) element.remove();
        else if (previous === null)
          element.removeAttribute(element.tagName === "LINK" ? "href" : "content");
        else element.setAttribute(element.tagName === "LINK" ? "href" : "content", previous);
        if (!created && !marked) element.removeAttribute("data-seo");
      }
    };
  }, [title, description, canonical, robots]);
}
