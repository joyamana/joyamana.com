"use server";

import { randomUUID } from "node:crypto";
import {
  parseContactForm,
  type ContactField,
  type ContactFormState,
} from "@/lib/contact";
import { deliverContactMessage } from "@/lib/contact-delivery.server";
import { locales, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

function safeLocale(locale: Locale): Locale {
  return locales.includes(locale) ? locale : "en-US";
}

function localizedFieldErrors(
  locale: Locale,
  errors: Partial<Record<ContactField, string>>,
) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => {
      const message =
        error === "required"
          ? uiText(locale, {
              en: "Choose a topic.",
              es: "Selecciona un tema.",
              fr: "Choisissez un sujet.",
            })
          : field === "email"
            ? uiText(locale, {
                en: "Enter a valid email address.",
                es: "Ingresa un correo electrónico válido.",
                fr: "Saisissez une adresse courriel valide.",
              })
            : error === "tooShort"
              ? uiText(locale, {
                  en: "Please add a little more detail.",
                  es: "Añade un poco más de detalle.",
                  fr: "Ajoutez un peu plus de détails.",
                })
              : uiText(locale, {
                  en: "This entry is too long.",
                  es: "Este campo es demasiado largo.",
                  fr: "Cette réponse est trop longue.",
                });
      return [field, message];
    }),
  ) as Partial<Record<ContactField, string>>;
}

export async function submitContactAction(
  requestedLocale: Locale,
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const locale = safeLocale(requestedLocale);
  const parsed = parseContactForm(formData);

  // Return a normal success response to automated submissions without sending.
  if (parsed.honeypot) {
    return {
      status: "success",
      message: uiText(locale, {
        en: "Thank you. Your message has been received.",
        es: "Gracias. Hemos recibido tu mensaje.",
        fr: "Merci. Votre message a bien été reçu.",
      }),
      fieldErrors: {},
      values: { ...parsed.values, message: "" },
    };
  }

  if (!parsed.submission) {
    return {
      status: "error",
      message: uiText(locale, {
        en: "Check the highlighted fields and try again.",
        es: "Revisa los campos indicados e inténtalo de nuevo.",
        fr: "Vérifiez les champs indiqués et réessayez.",
      }),
      fieldErrors: localizedFieldErrors(locale, parsed.fieldErrors),
      values: parsed.values,
    };
  }

  try {
    await deliverContactMessage({
      submission: parsed.submission,
      locale,
      idempotencyKey: randomUUID(),
    });
    return {
      status: "success",
      message: uiText(locale, {
        en: "Your message has been sent. We will reply by email.",
        es: "Tu mensaje ha sido enviado. Te responderemos por correo electrónico.",
        fr: "Votre message a été envoyé. Nous vous répondrons par courriel.",
      }),
      fieldErrors: {},
      values: {
        topic: "",
        name: "",
        email: "",
        orderNumber: "",
        message: "",
      },
    };
  } catch {
    return {
      status: "error",
      message: uiText(locale, {
        en: "We could not send your message. Please email us directly.",
        es: "No pudimos enviar tu mensaje. Escríbenos directamente por correo electrónico.",
        fr: "Nous n’avons pas pu envoyer votre message. Écrivez-nous directement par courriel.",
      }),
      fieldErrors: {},
      values: parsed.values,
    };
  }
}
