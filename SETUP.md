# Launching Road to 9: step by step

About an hour, once. You'll create four free accounts, copy a few keys between them, and click Deploy. No coding needed.

Keep a private note open (not shared anywhere) to paste keys into as you go.

---

## 1. Supabase (logins and database)

> ✅ Already done by Claude: the `road-to-9` project (Mumbai region) and the whole database.
> If you ever need to rebuild it, paste `supabase/schema.sql` into **SQL Editor → New query** on an empty project and press **Run**.
> The default email templates work as they are, so there's nothing to change there.

1. Recommended: **Authentication → Sign In / Providers**. Under Email, turn **off** "Allow new users to sign up". (Only you can invite people. Even if this stays on, a stranger who signs up gets no access to anything.)
2. **Project Settings → API Keys** (or **API**). Copy into your note:
   - Project URL
   - the **publishable** (or **anon public**) key
   - the **secret** (or **service_role**) key. This one is secret: never share it.

## 2. Anthropic (powers Professor Prime)

1. Go to **console.anthropic.com** and sign up.
2. **Billing**: add a card and some credit.
3. **Limits**: set a monthly spend limit you're comfortable with. The app also caps each student at 40 Prime messages a day.
4. **API Keys → Create Key**, name it `road-to-9`, and copy it into your note. Secret.

You can skip this step to begin with. Prime will use written hints until you add the key.

## 3. GitHub (stores the code)

The code goes in a repository in your account (`ProffesorPrime`). Claude can upload it for you, or you can upload the folder at **github.com/new**.

## 4. Vercel (puts the site online)

1. Go to **vercel.com** → sign up with GitHub.
2. **Add New → Project** → choose the `road-to-9` repository → **Import**.
3. Open **Environment Variables** and add each of these (name on the left, value on the right):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret/service_role key |
   | `ANTHROPIC_API_KEY` | Your Anthropic key (optional at first) |
   | `TUTOR_EMAIL` | The email you'll log in with |
   | `TUTOR_NAME` | Your first name |
   | `NEXT_PUBLIC_SITE_URL` | Leave blank for now |

4. Press **Deploy**. After a minute or two you get an address like `road-to-9-abc.vercel.app`. Open it to see your homepage.
5. Go back to **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to that address (starting `https://`, no slash at the end), then **Deployments → ⋯ → Redeploy**.

If the deploy fails, copy the red error text from the build log and send it to Claude.

## 5. Connect Supabase to your site

Supabase → **Authentication → URL Configuration**:
- **Site URL**: your Vercel address, e.g. `https://road-to-9-abc.vercel.app`
- **Redirect URLs**: add `https://road-to-9-abc.vercel.app/**`

## 6. Make yourself the tutor

1. Supabase → **Authentication → Users → Add user → Send invitation**, using the same email as `TUTOR_EMAIL`.
2. Open the email, click the link, choose a password.
3. You'll land on your tutor dashboard.

## 7. Test it before real students

1. In the tutor dashboard, invite a **student** using a second email you own (tick the consent box).
2. Open that invite in a private browser window, set a password, and try some questions and Professor Prime.
3. Invite a **parent** with a third email and link them to the test student. Check the parent view.

## 8. Make it yours

- Your name, bio, WhatsApp, email and Instagram live in **`lib/site.js`**. On GitHub, open the file, click the pencil, edit, and **Commit changes**. Vercel updates the site by itself in a minute.
- Read through **`app/privacy/page.js`** and adjust it to match how you actually work.

## 9. Before you have lots of students

- **Emails**: Supabase's built-in email only sends a few invites per hour. Before inviting a whole class, set up a free email service (for example Resend) under **Supabase → Authentication → Emails → SMTP Settings**. Claude can walk you through it.
- **Your own domain**: buy one (e.g. `roadto9.ae` or `roadto9maths.com`), add it in **Vercel → Settings → Domains**, then update the Site URL and `NEXT_PUBLIC_SITE_URL` to match.
- **Tutor permit**: keep your MoHRE private teacher permit up to date.

---

## What's where (for later)

| Folder | What it is |
|---|---|
| `app/` | The pages: homepage, login, student app, parent view, tutor dashboard |
| `app/api/` | The server: questions, answer checking, Professor Prime, invites |
| `lib/questions.js` | The question generators for every topic |
| `lib/prime.js` | Professor Prime's personality and safety rules |
| `lib/site.js` | Your homepage details |
| `supabase/schema.sql` | The database tables and security rules |
