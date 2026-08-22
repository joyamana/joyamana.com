import { LocaleShell } from "@/components/locale-shell";

export default function SpanishUSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleShell locale="es-US">{children}</LocaleShell>;
}
