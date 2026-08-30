import { brand } from "@/config/brand";
import type { ContactSubmission } from "@/lib/contact";
import type { Locale } from "@/lib/i18n/locales";

const resendEndpoint = "https://api.resend.com/emails";

const topicLabels = {
  order: "Order help",
  return: "Return or damaged item",
  product: "Product question",
  accessibility: "Accessibility",
  other: "Other",
} as const;

export function isContactFormEnabled() {
  return (
    process.env.CONTACT_FORM_ENABLED === "true" &&
    Boolean(process.env.RESEND_API_KEY)
  );
}

export async function deliverContactMessage({
  submission,
  locale,
  idempotencyKey,
}: {
  submission: ContactSubmission;
  locale: Locale;
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!isContactFormEnabled() || !apiKey) {
    throw new Error("Contact delivery is not configured.");
  }

  const topic = topicLabels[submission.topic];
  const subjectParts = [`[Joya Mana contact] ${topic}`];
  if (submission.orderNumber) subjectParts.push(submission.orderNumber);

  const text = [
    "New Joya Mana contact request",
    "",
    `Topic: ${topic}`,
    `Name: ${submission.name || "Not provided"}`,
    `Email: ${submission.email}`,
    `Order number: ${submission.orderNumber || "Not provided"}`,
    `Locale: ${locale}`,
    "",
    "Message:",
    submission.message,
  ].join("\n");

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: `${brand.name} <${brand.supportEmail}>`,
      to: [brand.supportEmail],
      reply_to: submission.email,
      subject: subjectParts.join(" · "),
      text,
      tags: [{ name: "contact_topic", value: submission.topic }],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error("Contact delivery failed.");
  }
}
