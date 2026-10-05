import { expect, it } from "vitest";
import { languageHref } from "./language-href";

it("keeps the selected variant and drops unrelated parameters", () => {
  expect(
    languageHref("zh-Hant-US", "/products/rose", "?variant=123&utm_source=ad"),
  ).toBe("/zh-hant-us/products/rose?variant=123");
});

it("keeps catalog filters when returning to English", () => {
  expect(
    languageHref(
      "en-US",
      "/zh-hant-us/collections/rose",
      "?color=Pink&available=1&sort=price-asc&ref=ad",
    ),
  ).toBe("/collections/rose?available=1&color=pink&sort=price-asc");
});

it("keeps the current non-commerce page without tracking parameters", () => {
  expect(languageHref("zh-Hant-US", "/about/our-story", "?ref=ad")).toBe(
    "/zh-hant-us/about/our-story",
  );
});

it("maps the localized home back to the root", () => {
  expect(languageHref("en-US", "/zh-hant-us")).toBe("/");
});
