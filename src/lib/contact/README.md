# Contact form email

The shop does not send any other email. Contact submissions go through the Resend HTTP API.

Required in Vercel:

- `RESEND_API_KEY` — API key from the Resend account. Not stored in the repo.

Optional:

- `CONTACT_EMAIL_FROM` — verified sender. Defaults to `EvaPremium <onboarding@resend.dev>`.
- `CONTACT_EMAIL_TO` — defaults to `evapremium.kontakt@gmail.com`.

Until a domain is verified, Resend delivers `onboarding@resend.dev` only to the address on the Resend account. Create that account as `evapremium.kontakt@gmail.com`, or set `CONTACT_EMAIL_FROM` to a verified address on `evapremium.pl`.

`POST /api/contact` validates the body, drops honeypot hits, and limits each IP to 5 messages per 10 minutes. Reply-To is the customer email.
