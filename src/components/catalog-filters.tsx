"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useTransition,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import {
  catalogPath,
  catalogQueryString,
  type CatalogQuery,
  type ColorFacet,
} from "@/lib/commerce/catalog-browse";
import { catalogCopy, colorLabel } from "@/lib/i18n/catalog-copy";
import type { EnabledLocale as Locale } from "@/config/locales";

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 8 3 3 6-6" />
    </svg>
  );
}

function activateWithSpace(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}

export function CatalogFilters({
  path,
  query,
  colors,
  count,
  locale,
}: {
  path: string;
  query: CatalogQuery;
  colors: ColorFacet[];
  count: number;
  locale: Locale;
}) {
  const copy = catalogCopy(locale);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selection, setSelection] = useOptimistic(query);
  const availabilityRef = useRef<HTMLAnchorElement>(null);
  const colorsRef = useRef<HTMLDetailsElement>(null);
  const sortRef = useRef<HTMLDetailsElement>(null);
  const id = useId();
  const hasFilters =
    selection.availableOnly ||
    selection.colors.length > 0 ||
    selection.invalidColors;
  const withoutFilters = {
    ...selection,
    availableOnly: false,
    colors: [],
    invalidColors: false,
  };
  const sorts = [
    { value: "default", label: copy.defaultSort, short: copy.defaultSortShort },
    { value: "price-asc", label: copy.priceAsc, short: copy.priceAscShort },
    { value: "price-desc", label: copy.priceDesc, short: copy.priceDescShort },
  ] as const;

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      for (const panel of [colorsRef.current, sortRef.current]) {
        if (panel?.open && !panel.contains(event.target as Node))
          panel.open = false;
      }
    }
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      for (const panel of [colorsRef.current, sortRef.current]) {
        if (!panel?.open) continue;
        panel.open = false;
        panel
          .querySelector<HTMLElement>("summary")
          ?.focus({ preventScroll: true });
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function openOne(event: SyntheticEvent<HTMLDetailsElement>) {
    const current = event.currentTarget;
    if (!current.open) return;
    for (const panel of [colorsRef.current, sortRef.current]) {
      if (panel && panel !== current) panel.open = false;
    }
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, next: CatalogQuery) {
    // Keep real GET links for refresh, sharing, new tabs and JavaScript-free use.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (catalogQueryString(next) === catalogQueryString(selection)) return;
    startTransition(() => {
      setSelection(next);
      router.push(catalogPath(path, next), { scroll: false });
    });
  }

  function focusSummary(panel: HTMLDetailsElement | null) {
    panel
      ?.querySelector<HTMLElement>("summary")
      ?.focus({ preventScroll: true });
  }

  return (
    <section
      className="catalog-tools"
      aria-label={copy.filter}
      aria-busy={pending}
    >
      <div className="catalog-tools__bar">
        <div className="catalog-tools__controls">
          <Link
            ref={availabilityRef}
            className="catalog-toggle"
            role="checkbox"
            aria-checked={selection.availableOnly}
            onKeyDown={activateWithSpace}
            scroll={false}
            href={catalogPath(path, {
              ...selection,
              availableOnly: !selection.availableOnly,
            })}
            onClick={(event) =>
              navigate(event, {
                ...selection,
                availableOnly: !selection.availableOnly,
              })
            }
          >
            <span className="catalog-toggle__track" aria-hidden="true">
              <span />
            </span>
            {copy.available}
          </Link>

          <details
            className="catalog-popover catalog-popover--colors"
            ref={colorsRef}
            onToggle={openOne}
          >
            <summary aria-controls={`${id}-colors`}>
              {copy.colors}
              {selection.colors.length ? (
                <span className="catalog-selection-count">
                  {selection.colors.length}
                </span>
              ) : null}
              <Chevron />
            </summary>
            <div className="catalog-popover__panel" id={`${id}-colors`}>
              <div className="catalog-popover__heading">
                <span>{copy.colors}</span>
                {selection.colors.length || selection.invalidColors ? (
                  <Link
                    className="catalog-text-action"
                    scroll={false}
                    href={catalogPath(path, {
                      ...selection,
                      colors: [],
                      invalidColors: false,
                    })}
                    onClick={(event) => {
                      focusSummary(colorsRef.current);
                      navigate(event, {
                        ...selection,
                        colors: [],
                        invalidColors: false,
                      });
                    }}
                  >
                    {copy.clearColors}
                  </Link>
                ) : null}
              </div>
              {colors.length ? (
                <div
                  className="catalog-color-options"
                  role="group"
                  aria-label={copy.colors}
                >
                  {colors.map((color) => {
                    const checked = selection.colors.includes(color.key);
                    const next = {
                      ...selection,
                      invalidColors: false,
                      colors: checked
                        ? selection.colors.filter((key) => key !== color.key)
                        : [...selection.colors, color.key].sort(),
                    };
                    return (
                      <Link
                        className="catalog-option"
                        key={color.key}
                        role="checkbox"
                        aria-checked={checked}
                        scroll={false}
                        onKeyDown={activateWithSpace}
                        href={catalogPath(path, next)}
                        onClick={(event) => navigate(event, next)}
                      >
                        <span
                          className="catalog-option__check"
                          aria-hidden="true"
                        >
                          {checked ? <Check /> : null}
                        </span>
                        <span>
                          {colorLabel(color.key, color.label, locale)}
                        </span>
                        <small>{color.count}</small>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="catalog-popover__empty">{copy.noColors}</p>
              )}
            </div>
          </details>

          <details
            className="catalog-popover catalog-popover--sort"
            ref={sortRef}
            onToggle={openOne}
          >
            <summary aria-controls={`${id}-sort`}>
              <span className="catalog-sort-label">{copy.sort}</span>
              <span>
                {sorts.find((sort) => sort.value === selection.sort)?.short}
              </span>
              <Chevron />
            </summary>
            <div className="catalog-popover__panel" id={`${id}-sort`}>
              <div className="catalog-popover__heading">{copy.sort}</div>
              <nav aria-label={copy.sort}>
                {sorts.map((sort) => {
                  const next = { ...selection, sort: sort.value };
                  const selected = selection.sort === sort.value;
                  return (
                    <Link
                      className="catalog-option catalog-option--sort"
                      key={sort.value}
                      scroll={false}
                      href={catalogPath(path, next)}
                      aria-current={selected ? "true" : undefined}
                      onClick={(event) => {
                        if (sortRef.current) sortRef.current.open = false;
                        focusSummary(sortRef.current);
                        navigate(event, next);
                      }}
                    >
                      <span>{sort.label}</span>
                      {selected ? <Check /> : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </details>
        </div>
        <p
          className="catalog-results-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {pending ? (
            <>
              <span className="catalog-progress" aria-hidden="true" />
              {copy.updating}
            </>
          ) : (
            <>
              <strong>{count}</strong> {copy.results}
            </>
          )}
        </p>
      </div>

      {hasFilters ? (
        <nav className="catalog-chips" aria-label={copy.selected}>
          {selection.availableOnly ? (
            <Link
              scroll={false}
              href={catalogPath(path, { ...selection, availableOnly: false })}
              aria-label={`${copy.remove}: ${copy.available}`}
              onClick={(event) => {
                availabilityRef.current?.focus({ preventScroll: true });
                navigate(event, { ...selection, availableOnly: false });
              }}
            >
              {copy.available}
              <span aria-hidden="true">×</span>
            </Link>
          ) : null}
          {selection.colors.map((key) => {
            const next = {
              ...selection,
              colors: selection.colors.filter((color) => color !== key),
            };
            const label = colorLabel(
              key,
              colors.find((color) => color.key === key)?.label ?? key,
              locale,
            );
            return (
              <Link
                key={key}
                scroll={false}
                href={catalogPath(path, next)}
                aria-label={`${copy.remove}: ${label}`}
                onClick={(event) => {
                  focusSummary(colorsRef.current);
                  navigate(event, next);
                }}
              >
                {label}
                <span aria-hidden="true">×</span>
              </Link>
            );
          })}
          <Link
            className="catalog-text-action"
            scroll={false}
            href={catalogPath(path, withoutFilters)}
            onClick={(event) => {
              availabilityRef.current?.focus({ preventScroll: true });
              navigate(event, withoutFilters);
            }}
          >
            {copy.clear}
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
