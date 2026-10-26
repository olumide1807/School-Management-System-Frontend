// Small helpers for rendering and driving components in jsdom
import type { ReactElement } from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

// Page text as a reader sees it: tags dropped, entities decoded, spaces collapsed
export const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const renderText = (el: ReactElement) => textOf(renderToStaticMarkup(el));

// Mounts into the document, flushing effects
export async function mount(el: ReactElement) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(el); });
  return {
    rerender: async (next: ReactElement) => { await act(async () => { root.render(next); }); },
    unmount: () => act(() => root.unmount()),
  };
}

export const bodyText = () => document.body.textContent || "";

export const buttonByText = (label: string) =>
  [...document.querySelectorAll("button")].filter((b) => b.textContent?.trim() === label) as HTMLButtonElement[];

export async function click(el: Element) {
  await act(async () => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });
}

// Sets a controlled input's value the way typing does, so React sees it
export async function setValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
  await act(async () => {
    el.dispatchEvent(new window.Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  });
}
