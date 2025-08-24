import { useMemo, useState } from "react";

const EMAIL_TO = "aryaman.25.sharma@gmail.com"; // change if needed

const isEmail = (v) => /.+@.+\..+/.test(String(v).trim());

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({});
  const [justOpenedEmail, setJustOpenedEmail] = useState(false);

  const errors = useMemo(() => {
    return {
      name: name.trim() ? null : "Please enter your name",
      email: email.trim() ? (isEmail(email) ? null : "Enter a valid email") : "Please enter your email",
      message: message.trim().length >= 10 ? null : "Message should be at least 10 characters",
    };
  }, [name, email, message]);

  const hasErrors = Object.values(errors).some(Boolean);

  const mailtoHref = useMemo(() => {
    const subject = `Portfolio contact from ${name || "(no name)"}`;
    const body = [
      `Name: ${name || "(no name)"}`,
      `Email: ${email || "(no email)"}`,
      "",
      message || "(no message)",
      "",
      `— Sent from portfolio (${new Date().toLocaleString()})`,
      typeof navigator !== "undefined" ? `UA: ${navigator.userAgent}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [name, email, message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;
    window.location.href = mailtoHref; // open default mail app
    setJustOpenedEmail(true);
  };

  // NEW — clear only the message field
  const clearMessage = () => {
    setMessage("");
    setTouched((t) => ({ ...t, message: false }));
    // focus textarea for convenience
    const el = document.getElementById("message");
    if (el) el.focus();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {justOpenedEmail && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 px-4 py-3 text-sm">
          Thanks! Your email app should have opened. If not, use the button below.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-slate-300">Name</label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            placeholder="Ada Lovelace"
            autoComplete="name"
            required
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-rose-300">{errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-slate-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-rose-300">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-slate-300">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          placeholder="A short note about what you'd like to build together…"
          required
        />
        {touched.message && errors.message && (
          <p className="mt-1 text-xs text-rose-300">{errors.message}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={hasErrors}
          className={`rounded-xl px-5 py-2.5 font-semibold shadow border ${
            hasErrors
              ? "bg-sky-600/50 text-white/80 border-white/10 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-500 text-white border-white/10"
          }`}
        >
          Send via Email
        </button>
        <a
          href={mailtoHref}
          className="rounded-xl px-5 py-2.5 font-semibold shadow border border-white/10 bg-white/5 text-slate-200 hover:border-sky-500/40"
        >
          Open Mail App
        </a>
        {/* REPLACED copy buttons with Clear */}
        <button
          type="button"
          onClick={clearMessage}
          className="rounded-xl px-4 py-2.5 border border-white/10 bg-white/5 text-slate-200 hover:border-sky-500/40"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
