import { SearchPage } from "@/components/pages/search-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="en-US" query={(await searchParams).q || ""} />;
}
