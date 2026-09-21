"use client";

import type { ErrorInfo } from "next/error";
import { PageErrorContent } from "@/components/page-error-content";

export default function ErrorPage({ retry }: ErrorInfo) {
  return <PageErrorContent locale="en-US" retry={retry} />;
}
