# Thrift Heals

A one-of-a-kind secondhand heels storefront. Sizes 34-42, every heel Rs 999,
cash on delivery. Built with Next.js + Tailwind, free to run.

- **Inventory**: you manage it in a Google Sheet - no code editing.
- **"Sold out" tracking**: a free Supabase database. The moment someone
  orders a heel, it disappears from the site for everyone else.
- **Orders**: cash on delivery - customers fill in name, phone, address.
- **Notifications**: an email to you for every order (free, via Resend),
  plus a password-protected `/admin/orders` page.
- **Reviews**: a password-protected `/admin/reviews` page to post
  customer screenshots; they show up on the public `/reviews` page.
- **Search + size filter**: built into the homepage.
- **Google Image Search**: every product page has descriptive image alt
  text, an OG image tag, and Product structured data - the groundwork
  Google needs to show your images. You still need to submit your
  sitemap (step 6) and it can take Google days to weeks to index you.

## 1. Run it locally

You'll need Node.js 18+ (https://nodejs.org).

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site works with sample heels out of the box. It won't fully work
(sold-tracking, orders, reviews) until you do steps 2-4 below.

## 2. Set up your Google Sheet (weekly inventory)

1. Create a new Google Sheet with these exact column headers in row 1:
   `ID`, `Name`, `Size`, `Image`, `Description`
   - **ID**: a unique code per pair, e.g. `TH-001`. Never reuse one.
   - **Size**: a number from 34-42 (as text is fine).
   - **Image**: a direct link to the photo (see note below).
   - **Description**: optional, shown on the product page.
2. Go to **File -> Share -> Publish to web**. Choose the sheet, pick
   **Comma-separated values (.csv)**, and click **Publish**. Copy the
   link it gives you.
3. Paste that link into `.env.local` (and later, Vercel) as
   `GOOGLE_SHEET_CSV_URL`.
4. Add/remove rows any time - the site picks up changes within about a
   minute, no redeploy needed.

**About photos:** paste a direct image link in the `Image` column. The
easiest free way to get one: upload the photo to a public Google Drive
folder, right-click -> Get link -> set to "Anyone with the link," then
convert the link using a free tool like
`https://drive.google.com/uc?export=view&id=FILE_ID` (the `FILE_ID` is
the long code in the share link). Any other free image host (e.g.
Imgur) works too - the column just needs a link that opens directly to
the image.

## 3. Set up Supabase (free - sold tracking, orders, reviews)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run this once to create the tables:

```sql
create table sold_heels (
  heel_id text primary key,
  sold_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text,
  pincode text,
  heel_ids text[] not null,
  total integer not null
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  image_url text not null,
  caption text
);
```

3. Go to **Settings -> API** and copy three values into `.env.local`
   (and later, Vercel):
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (click "Reveal") -> `SUPABASE_SERVICE_ROLE_KEY`
     - keep this one secret, never put it in the browser or commit it.

**For review screenshots:** the simplest free option is Supabase
Storage. In your project, go to **Storage -> New bucket**, name it
`reviews`, and make it **public**. Drag a screenshot in, click it, and
copy its public URL - that's what you paste into `/admin/reviews`.

## 4. Set up Resend (free - order email notifications)

1. Create a free account at https://resend.com (100 emails/day free,
   no credit card).
2. Go to **API Keys**, create one, and put it in `.env.local` as
   `RESEND_API_KEY`.
3. Set `NOTIFY_EMAIL` to the email address you want order alerts sent
   to.
4. Orders will still save and show up on `/admin/orders` even without
   this step - email is a bonus layer, not the only way to see orders.

## 5. Set your admin password

Pick any password and set it as `ADMIN_PASSWORD` in `.env.local`. This
protects `/admin/orders` (see every order) and `/admin/reviews` (post a
new customer screenshot).

## 6. Push to GitHub

```bash
git init
git add .
git commit -m "Thrift Heals storefront"
git remote add origin https://github.com/YOUR-USERNAME/thrift-heals.git
git branch -M main
git push -u origin main
```

## 7. Deploy to Vercel (free)

1. Sign up at https://vercel.com with your GitHub account.
2. **Add New -> Project**, import your `thrift-heals` repo.
3. Before deploying, expand **Environment Variables** and add every
   variable from `.env.example` with your real values (including
   `NEXT_PUBLIC_SITE_URL` - set it to the `.vercel.app` URL Vercel
   shows you, e.g. `https://thrift-heals.vercel.app`).
4. Click **Deploy**.
5. Once live, go to https://search.google.com/search-console, add your
   site, and submit `https://your-site.vercel.app/sitemap.xml` - this
   is what actually gets your product photos into Google Image Search.

Every `git push` to `main` auto-redeploys.

## How a sale works, end to end

1. Customer adds heels to their cart and fills in the COD form.
2. The site tries to "claim" each heel in Supabase. If two people order
   the same one-of-a-kind heel at nearly the same moment, only the
   first claim succeeds - the second customer is told that item just
   sold and it's dropped from their order automatically.
3. The order is saved, the heel(s) vanish from the site immediately,
   you get an email, and it appears on `/admin/orders`.
4. You call the customer to confirm and ship - cash is collected on
   delivery, so there's no online payment step.

## Notes

- Every heel is one physical piece - the cart won't let you add the
  same one twice, and there's no quantity field.
- Shipping is Rs 350 / 600 / 700 / 800 / 900 for 1-5 heels, and Rs 100
  per extra heel beyond that (edit `lib/shipping.ts` to change this).
- `/admin/orders` and `/admin/reviews` are protected by your one shared
  password, not full user accounts - good enough for a solo shop, but
  don't share that link publicly.
