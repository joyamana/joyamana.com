import type { Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <section className="form-page">
      <div>
        <p className="eyebrow">{uiText(locale, { en: "Prototype support", es: "Ayuda de prototipo", fr: "Soutien prototype" })}</p>
        <h1>{uiText(locale, { en: "How can we help?", es: "¿En qué podemos ayudarte?", fr: "Comment pouvons-nous vous aider?" })}</h1>
        <p>
          {uiText(locale, { en: "Email and form delivery will be connected when an approved support channel exists.", es: "El correo y el envío del formulario se conectarán cuando exista un canal de soporte aprobado.", fr: "Le courriel et l’envoi du formulaire seront connectés lorsqu’un canal de soutien approuvé existera." })}
        </p>
      </div>
      <form className="contact-form">
        <label>
          {uiText(locale, { en: "Name", es: "Nombre", fr: "Nom" })}
          <input type="text" name="name" autoComplete="name" />
        </label>
        <label>
          {uiText(locale, { en: "Email", es: "Correo electrónico", fr: "Courriel" })}
          <input type="email" name="email" autoComplete="email" />
        </label>
        <label>
          {uiText(locale, { en: "Message", es: "Mensaje", fr: "Message" })}
          <textarea name="message" rows={6} />
        </label>
        <button className="button button--primary" type="button" disabled>
          {uiText(locale, { en: "Submission not connected", es: "Envío aún no conectado", fr: "Envoi non connecté" })}
        </button>
      </form>
    </section>
  );
}
