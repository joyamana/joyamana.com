import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { blogEntries } from "@/lib/content/content";

export function generateStaticParams() {
  return blogEntries.map(({ handle }) => ({ handle }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <EditorialDetailPage
      locale="en-US"
      entries={blogEntries}
      handle={(await params).handle}
      kind="blog"
    />
  );
}
