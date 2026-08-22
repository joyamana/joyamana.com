import { LocaleShell } from "@/components/locale-shell";

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleShell locale="en-US">{children}</LocaleShell>;
}
