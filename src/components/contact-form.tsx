"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef } from "react";
import { submitContactAction } from "@/app/actions/contact";
import {
  initialContactFormState,
  type ContactField,
} from "@/lib/contact";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ContactForm({ locale }: { locale: Locale }) {
  const action = useMemo(
    () => submitContactAction.bind(null, locale),
    [locale],
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialContactFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  const errorId = (field: ContactField) =>
    state.fieldErrors[field] ? `contact-${field}-error` : undefined;

  return (
    <form action={formAction} className="contact-form" ref={formRef}>
      <div className="contact-form__field">
        <label htmlFor="contact-topic">
          {uiText(locale, { en: "Topic", es: "Tema", fr: "Sujet" })}
        </label>
        <select
          aria-describedby={errorId("topic")}
          aria-invalid={Boolean(state.fieldErrors.topic)}
          defaultValue={state.values.topic}
          id="contact-topic"
          name="topic"
          required
        >
          <option disabled value="">
            {uiText(locale, {
              en: "Choose a topic",
              es: "Selecciona un tema",
              fr: "Choisissez un sujet",
            })}
          </option>
          <option value="order">
            {uiText(locale, {
              en: "Order help",
              es: "Ayuda con un pedido",
              fr: "Aide avec une commande",
            })}
          </option>
          <option value="return">
            {uiText(locale, {
              en: "Return or damaged item",
              es: "Devolución o artículo dañado",
              fr: "Retour ou article endommagé",
            })}
          </option>
          <option value="product">
            {uiText(locale, {
              en: "Product question",
              es: "Pregunta sobre un producto",
              fr: "Question sur un produit",
            })}
          </option>
          <option value="accessibility">
            {uiText(locale, {
              en: "Accessibility",
              es: "Accesibilidad",
              fr: "Accessibilité",
            })}
          </option>
          <option value="other">
            {uiText(locale, { en: "Other", es: "Otro", fr: "Autre" })}
          </option>
        </select>
        <FieldError id={errorId("topic")} message={state.fieldErrors.topic} />
      </div>

      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="contact-name">
            {uiText(locale, {
              en: "Name (optional)",
              es: "Nombre (opcional)",
              fr: "Nom (facultatif)",
            })}
          </label>
          <input
            aria-describedby={errorId("name")}
            aria-invalid={Boolean(state.fieldErrors.name)}
            autoComplete="name"
            defaultValue={state.values.name}
            id="contact-name"
            maxLength={80}
            name="name"
            type="text"
          />
          <FieldError id={errorId("name")} message={state.fieldErrors.name} />
        </div>
        <div className="contact-form__field">
          <label htmlFor="contact-email">
            {uiText(locale, {
              en: "Email",
              es: "Correo electrónico",
              fr: "Courriel",
            })}
          </label>
          <input
            aria-describedby={errorId("email")}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            defaultValue={state.values.email}
            id="contact-email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
          <FieldError id={errorId("email")} message={state.fieldErrors.email} />
        </div>
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-order">
          {uiText(locale, {
            en: "Order number (optional)",
            es: "Número de pedido (opcional)",
            fr: "Numéro de commande (facultatif)",
          })}
        </label>
        <input
          aria-describedby={errorId("orderNumber")}
          aria-invalid={Boolean(state.fieldErrors.orderNumber)}
          autoComplete="off"
          defaultValue={state.values.orderNumber}
          id="contact-order"
          maxLength={50}
          name="orderNumber"
          placeholder="#1001"
          type="text"
        />
        <FieldError
          id={errorId("orderNumber")}
          message={state.fieldErrors.orderNumber}
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">
          {uiText(locale, { en: "Message", es: "Mensaje", fr: "Message" })}
        </label>
        <textarea
          aria-describedby={errorId("message")}
          aria-invalid={Boolean(state.fieldErrors.message)}
          defaultValue={state.values.message}
          id="contact-message"
          maxLength={4000}
          minLength={10}
          name="message"
          required
          rows={7}
        />
        <FieldError
          id={errorId("message")}
          message={state.fieldErrors.message}
        />
      </div>

      <div aria-hidden="true" className="contact-form__honeypot">
        <label htmlFor="contact-company">Company</label>
        <input
          autoComplete="off"
          id="contact-company"
          name="company"
          tabIndex={-1}
          type="text"
        />
      </div>

      <p className="contact-form__notice">
        {uiText(locale, {
          en: "Please do not include payment card information or passwords. We use these details only to respond to this request; submitting this form does not subscribe you to marketing.",
          es: "No incluyas datos de tarjetas de pago ni contraseñas. Usamos esta información solo para responder a esta solicitud; enviar el formulario no te suscribe a comunicaciones de marketing.",
          fr: "N’indiquez aucun numéro de carte ni mot de passe. Ces renseignements servent uniquement à répondre à cette demande; l’envoi du formulaire ne vous inscrit pas au marketing.",
        })}{" "}
        <Link href={localePath(locale, "/privacy")}>
          {uiText(locale, {
            en: "Privacy",
            es: "Privacidad",
            fr: "Confidentialité",
          })}
        </Link>
      </p>

      {state.message ? (
        <p
          aria-live="polite"
          className={`contact-form__status contact-form__status--${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <button className="button button--primary" disabled={pending} type="submit">
        {pending
          ? uiText(locale, {
              en: "Sending…",
              es: "Enviando…",
              fr: "Envoi…",
            })
          : uiText(locale, {
              en: "Send message",
              es: "Enviar mensaje",
              fr: "Envoyer le message",
            })}
      </button>
    </form>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  return message && id ? (
    <span className="contact-form__error" id={id}>
      {message}
    </span>
  ) : null;
}
