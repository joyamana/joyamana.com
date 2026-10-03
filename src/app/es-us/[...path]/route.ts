import { notFoundResponse } from "@/lib/http/not-found";

export function GET() {
  return notFoundResponse("es-US");
}
