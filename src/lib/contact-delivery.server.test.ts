import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deliverContactMessage,
  isContactFormEnabled,
} from "./contact-delivery.server";

const originalEnabled = process.env.CONTACT_FORM_ENABLED;
const originalApiKey = process.env.RESEND_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalEnabled === undefined) delete process.env.CONTACT_FORM_ENABLED;
  else process.env.CONTACT_FORM_ENABLED = originalEnabled;
  if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalApiKey;
});

describe("contact delivery", () => {
  it("stays disabled unless both the release gate and secret are present", () => {
    process.env.CONTACT_FORM_ENABLED = "false";
    process.env.RESEND_API_KEY = "test-key";
    expect(isContactFormEnabled()).toBe(false);

    process.env.CONTACT_FORM_ENABLED = "true";
    delete process.env.RESEND_API_KEY;
    expect(isContactFormEnabled()).toBe(false);
  });

  it("sends only from and to info@ with the customer as Reply-To", async () => {
    process.env.CONTACT_FORM_ENABLED = "true";
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await deliverContactMessage({
      locale: "en-US",
      idempotencyKey: "contact-test-1",
      submission: {
        topic: "order",
        name: "A Customer",
        email: "customer@example.com",
        orderNumber: "#1001",
        message: "Please help me with this order.",
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(request.headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Idempotency-Key": "contact-test-1",
    });
    expect(JSON.parse(request.body as string)).toMatchObject({
      from: "Joya Mana <info@joyamana.com>",
      to: ["info@joyamana.com"],
      reply_to: "customer@example.com",
    });
  });
});
