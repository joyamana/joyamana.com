import { describe, expect, it } from "vitest";
import { parseContactForm } from "./contact";

function validFormData() {
  const formData = new FormData();
  formData.set("topic", "order");
  formData.set("name", "A Customer");
  formData.set("email", "customer@example.com");
  formData.set("orderNumber", "#1001");
  formData.set("message", "Please help me with this order.");
  return formData;
}

describe("contact form validation", () => {
  it("accepts and normalizes the minimum support fields", () => {
    const result = parseContactForm(validFormData());

    expect(result.fieldErrors).toEqual({});
    expect(result.submission).toEqual({
      topic: "order",
      name: "A Customer",
      email: "customer@example.com",
      orderNumber: "#1001",
      message: "Please help me with this order.",
    });
  });

  it("rejects invalid topics, email addresses, and undersized messages", () => {
    const formData = validFormData();
    formData.set("topic", "marketing");
    formData.set("email", "not-an-email");
    formData.set("message", "Help");

    const result = parseContactForm(formData);

    expect(result.submission).toBeNull();
    expect(result.fieldErrors).toEqual({
      topic: "required",
      email: "invalid",
      message: "tooShort",
    });
  });

  it("detects the hidden anti-spam field without adding it to the message", () => {
    const formData = validFormData();
    formData.set("company", "Spam Company");

    const result = parseContactForm(formData);

    expect(result.honeypot).toBe("Spam Company");
    expect(result.submission).not.toHaveProperty("company");
  });
});
