"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { getCopy } from "@/lib/i18n/copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import {
  localePath,
  stripLocalePrefix,
  languageOptionsFor,
} from "@/lib/i18n/locales";
import {
  collectionNavigationFor,
  type CatalogNavigationLink,
} from "@/lib/navigation/catalog-navigation";
import { uiText } from "@/lib/i18n/text";
import { useCart } from "./cart-provider";
import { LanguageSwitch } from "./language-switch";
import { BrandLogo } from "./brand-logo";
import { commerceLanguageQueryFromSearch } from "@/lib/commerce/catalog-browse";

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="header-action__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="header-action__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="header-action__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="header-action__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

type DesktopMenuId = "shop" | "collections";

function DesktopNavDropdown({
  active,
  groupLabel,
  id,
  label,
  links,
  open,
  onOpenChange,
}: {
  active: boolean;
  groupLabel: string;
  id: DesktopMenuId;
  label: string;
  links: CatalogNavigationLink[];
  open: boolean;
  onOpenChange: (id: DesktopMenuId, open: boolean) => void;
}) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openMenu = useCallback(() => {
    cancelScheduledClose();
    onOpenChange(id, true);
  }, [cancelScheduledClose, id, onOpenChange]);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => onOpenChange(id, false), 120);
  }, [cancelScheduledClose, id, onOpenChange]);

  useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

  return (
    <details
      className={`nav-dropdown${active ? " nav-dropdown--active" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onOpenChange(id, false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        onOpenChange(id, false);
        event.currentTarget.querySelector("summary")?.focus();
      }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onToggle={(event) => onOpenChange(id, event.currentTarget.open)}
      open={open}
    >
      <summary className="nav-dropdown__trigger">
        <span>{label}</span>
      </summary>
      <div className="nav-dropdown__panel">
        <div className="nav-dropdown__content">
          <div className="nav-dropdown__group">
            <p className="eyebrow">{groupLabel}</p>
            <div className="nav-dropdown__links">
              {links.map((link) => (
                <Link
                  href={link.href}
                  key={link.href}
                  onClick={() => onOpenChange(id, false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function MobileNavDropdown({
  label,
  links,
  onNavigate,
}: {
  label: string;
  links: CatalogNavigationLink[];
  onNavigate: () => void;
}) {
  return (
    <details className="mobile-nav-dropdown">
      <summary>
        <span>{label}</span>
        <span aria-hidden="true" className="mobile-nav-dropdown__icon">
          +
        </span>
      </summary>
      <div className="mobile-nav-dropdown__links">
        {links.map((link) => (
          <Link href={link.href} key={link.href} onClick={onNavigate}>
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export function SiteHeader({
  categoryLinks,
  collectionLinks,
  locale,
}: {
  categoryLinks: CatalogNavigationLink[];
  collectionLinks: CatalogNavigationLink[];
  locale: Locale;
}) {
  const copy = getCopy(locale);
  const { count } = useCart();
  const pathname = usePathname();
  const basePath = stripLocalePrefix(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const [openDesktopMenu, setOpenDesktopMenu] = useState<DesktopMenuId | null>(
    null,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDialogElement>(null);
  const menuLabel = uiText(locale, {
    zh: "選單",
    en: "Menu",
    es: "Menú",
  });
  const shopLinks: CatalogNavigationLink[] = [
    {
      href: localePath(locale, "/shop"),
      label: uiText(locale, {
        zh: "選購所有商品",
        en: "Shop all",
        es: "Ver todo",
      }),
    },
    ...categoryLinks,
  ];
  const collectionsNavigation = collectionNavigationFor(collectionLinks);
  const collectionDropdownLinks: CatalogNavigationLink[] = [
    {
      href: localePath(locale, "/collections"),
      label: uiText(locale, {
        zh: "查看全部",
        en: "View all",
        es: "Ver todas",
      }),
    },
    ...collectionLinks,
  ];
  const handleDesktopMenuChange = useCallback(
    (id: DesktopMenuId, open: boolean) => {
      setOpenDesktopMenu((current) => {
        if (open) return id;
        return current === id ? null : current;
      });
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => {
      const trigger = menuButtonRef.current;
      if (trigger?.getClientRects().length) trigger.focus();
      else
        document
          .querySelector<HTMLAnchorElement>(".site-header .wordmark")
          ?.focus();
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = menuDialogRef.current;
    dialog?.showModal();
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeOnDesktop = () => {
      if (desktop.matches) closeMenu();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [closeMenu, menuOpen]);

  return (
    <>
      <header className="site-header">
        <button
          aria-controls="mobile-site-menu"
          aria-expanded={menuOpen}
          aria-label={menuLabel}
          className="mobile-menu-trigger"
          onClick={() => {
            setLanguageQuery(
              commerceLanguageQueryFromSearch(basePath, window.location.search),
            );
            setMenuOpen(true);
          }}
          ref={menuButtonRef}
          type="button"
        >
          <MenuIcon />
        </button>
        <Link
          className="wordmark"
          href={localePath(locale)}
          aria-label={uiText(locale, {
            zh: `${brand.name} 首頁`,
            en: `${brand.name} home`,
            es: `Inicio de ${brand.name}`,
          })}
        >
          <BrandLogo decorative />
        </Link>
        <nav
          className="desktop-nav"
          aria-label={uiText(locale, {
            zh: "主要導覽",
            en: "Primary navigation",
            es: "Navegación principal",
          })}
        >
          <DesktopNavDropdown
            active={basePath === "/shop" || basePath.startsWith("/category/")}
            groupLabel={uiText(locale, {
              zh: "選購",
              en: "Shop",
              es: "Comprar",
            })}
            id="shop"
            label={copy.nav.shop}
            links={shopLinks}
            onOpenChange={handleDesktopMenuChange}
            open={openDesktopMenu === "shop"}
          />
          {collectionsNavigation.kind === "direct"
            ? collectionsNavigation.links.map((link) => (
                <Link
                  href={link.href}
                  key={link.href}
                  onMouseEnter={() => setOpenDesktopMenu(null)}
                >
                  {link.label}
                </Link>
              ))
            : null}
          {collectionsNavigation.kind === "dropdown" ? (
            <DesktopNavDropdown
              active={basePath.startsWith("/collections")}
              groupLabel={uiText(locale, {
                zh: "系列",
                en: "Collections",
                es: "Colecciones",
              })}
              id="collections"
              label={copy.nav.collections}
              links={collectionDropdownLinks}
              onOpenChange={handleDesktopMenuChange}
              open={openDesktopMenu === "collections"}
            />
          ) : null}
          <Link
            href={localePath(locale, "/crystals")}
            onMouseEnter={() => setOpenDesktopMenu(null)}
          >
            {copy.nav.crystals}
          </Link>
          <Link
            href={localePath(locale, "/blog")}
            onMouseEnter={() => setOpenDesktopMenu(null)}
          >
            {copy.nav.blog}
          </Link>
          <Link
            href={localePath(locale, "/about")}
            onMouseEnter={() => setOpenDesktopMenu(null)}
          >
            {copy.nav.about}
          </Link>
        </nav>
        <div className="header-actions">
          <Link
            className="header-action header-action--search"
            href={localePath(locale, "/search")}
          >
            <SearchIcon />
            <span className="header-action__label">{copy.nav.search}</span>
          </Link>
          <div className="desktop-language-switch">
            <LanguageSwitch locale={locale} />
          </div>
          <Link
            aria-label={`${copy.nav.cart}${count > 0 ? ` (${count})` : ""}`}
            className="header-action header-action--bag"
            href={localePath(locale, "/cart")}
          >
            <BagIcon />
            <span className="header-action__label">{copy.nav.cart}</span>
            {count > 0 ? (
              <span aria-hidden="true" className="header-action__count">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
        {openDesktopMenu ? (
          <button
            aria-label={uiText(locale, {
              zh: "關閉導覽選單",
              en: "Close navigation menu",
              es: "Cerrar el menú de navegación",
            })}
            className="nav-dropdown-backdrop"
            onClick={() => setOpenDesktopMenu(null)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          />
        ) : null}
      </header>
      <dialog
        aria-label={menuLabel}
        className="mobile-menu"
        id="mobile-site-menu"
        ref={menuDialogRef}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <nav
          aria-label={uiText(locale, {
            zh: "流動版導覽",
            en: "Mobile navigation",
            es: "Navegación móvil",
          })}
          className="mobile-menu__panel"
        >
          <div className="mobile-menu__top">
            <span className="wordmark">
              <BrandLogo />
            </span>
            <button
              aria-label={uiText(locale, {
                zh: "關閉選單",
                en: "Close menu",
                es: "Cerrar menú",
              })}
              className="mobile-menu__close"
              onClick={() => closeMenu()}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mobile-menu__primary">
            <MobileNavDropdown
              label={copy.nav.shop}
              links={shopLinks}
              onNavigate={closeMenu}
            />
            {collectionsNavigation.kind === "direct"
              ? collectionsNavigation.links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    onClick={() => closeMenu()}
                  >
                    {link.label}
                  </Link>
                ))
              : null}
            {collectionsNavigation.kind === "dropdown" ? (
              <MobileNavDropdown
                label={copy.nav.collections}
                links={collectionDropdownLinks}
                onNavigate={closeMenu}
              />
            ) : null}
            <Link
              href={localePath(locale, "/crystals")}
              onClick={() => closeMenu()}
            >
              {copy.nav.crystals}
            </Link>
            <Link
              href={localePath(locale, "/blog")}
              onClick={() => closeMenu()}
            >
              {copy.nav.blog}
            </Link>
            <Link
              href={localePath(locale, "/about")}
              onClick={() => closeMenu()}
            >
              {copy.nav.about}
            </Link>
          </div>
          <div className="mobile-menu__language">
            <p className="eyebrow">
              {uiText(locale, {
                zh: "語言",
                en: "Language",
                es: "Idioma",
              })}
            </p>
            <div>
              {languageOptionsFor(locale).map((item) => (
                <Link
                  aria-current={item.locale === locale ? "page" : undefined}
                  href={`${localePath(item.locale, basePath)}${languageQuery ? `?${languageQuery}` : ""}`}
                  hrefLang={item.locale}
                  key={item.locale}
                  lang={item.locale}
                  onClick={() => closeMenu()}
                >
                  <span>{item.label}</span>
                  <span>{item.shortLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </dialog>
    </>
  );
}
