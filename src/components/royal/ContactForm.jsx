'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  return (
    <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setStatus('Message delivery is not configured yet. Your message was not sent.'); }}>
      <label>Name<input name="name" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
      <label>Message<textarea name="message" required /></label>
      <button className="button button-gold" type="submit">Send enquiry</button>
      {status && <p className="form-error" role="status">{status}</p>}
    </form>
  );
}