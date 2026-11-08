# Local setup and authentication

1. Copy `.env.example` to `.env`; use a unique `DJANGO_SECRET_KEY` and real database values. Never commit `.env`.
2. Install requirements, run `python manage.py migrate`, then `python manage.py runserver`.
3. In development, the console email backend prints verification messages. `OTP_DEV_ECHO=True` also returns the code in the registration response, only when `DEBUG=True`. Set it to false in shared environments.
4. For real email delivery configure an SMTP email backend and credentials through environment variables.
5. For Google Identity Services, register the exact frontend origin in Google Cloud, then set `GOOGLE_CLIENT_ID` in the backend and `VITE_GOOGLE_CLIENT_ID` in the frontend to the same OAuth client ID. Google ID tokens are checked server-side for audience, issuer, expiry, and verified email. The current checkout requires a signed-in account; a guest's cart remains in the browser while they sign in or register.
6. Password recovery sends a short-lived, one-use verification code. In local development the console email backend prints the message; `OTP_DEV_ECHO=True` also returns a development-only code while `DEBUG=True`. Turn this off outside local development.
7. Run `python manage.py seed_products` to create 100 repeatable demo products.

JWT bearer tokens are required for account and order routes. Product reads are public; product writes require a Django staff account.


## Local database choice

The checked-in example uses PostgreSQL (`DB_ENGINE=postgresql`). For a quick local setup without PostgreSQL credentials, set `DB_ENGINE=sqlite` in `.env`; Django will create `db.sqlite3` in this folder. Switch back to `postgresql` and provide `DB_PASSWORD` when your PostgreSQL credentials are available.
