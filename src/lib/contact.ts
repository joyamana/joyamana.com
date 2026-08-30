export const contactTopics = [
  "order",
  "return",
  "product",
  "accessibility",
  "other",
] as const;

export type ContactTopic = (typeof contactTopics)[number];

export interface ContactFormValues {
  topic: string;
  name: string;
  email: string;
  orderNumber: string;
  message: string;
}

export type ContactField = keyof ContactFormValues;

export interface ContactFormState {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Partial<Record<ContactField, string>>;
  values: ContactFormValues;
}

export interface ContactSubmission {
  topic: ContactTopic;
  name: string;
  email: string;
  orderNumber: string;
  message: string;
}

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: {
    topic: "",
    name: "",
    email: "",
    orderNumber: "",
    message: "",
  },
};

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.normalize("NFC").trim() : "";
}

function singleLine(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ");
}

export function parseContactForm(formData: FormData) {
  const values: ContactFormValues = {
    topic: singleLine(formText(formData, "topic")),
    name: singleLine(formText(formData, "name")),
    email: singleLine(formText(formData, "email")),
    orderNumber: singleLine(formText(formData, "orderNumber")),
    message: formText(formData, "message")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ""),
  };
  const fieldErrors: Partial<Record<ContactField, string>> = {};

  if (!contactTopics.includes(values.topic as ContactTopic)) {
    fieldErrors.topic = "required";
  }
  if (values.name.length > 80) fieldErrors.name = "tooLong";
  if (
    !values.email ||
    values.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  ) {
    fieldErrors.email = "invalid";
  }
  if (values.orderNumber.length > 50) fieldErrors.orderNumber = "tooLong";
  if (values.message.length < 10) fieldErrors.message = "tooShort";
  if (values.message.length > 4000) fieldErrors.message = "tooLong";

  const topic = contactTopics.includes(values.topic as ContactTopic)
    ? (values.topic as ContactTopic)
    : null;

  return {
    values,
    fieldErrors,
    honeypot: formText(formData, "company"),
    submission:
      topic && Object.keys(fieldErrors).length === 0
        ? ({ ...values, topic } satisfies ContactSubmission)
        : null,
  };
}
