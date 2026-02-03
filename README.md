
  # Design login page

  This is a code bundle for Design login page. The original project is available at https://www.figma.com/design/l9RiRyUVUh1IP65aJiNhAt/Design-login-page.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Supabase env vars

Create a `.env.local` with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Routing note

This is a single-page app. When deployed (e.g., Vercel), configure a rewrite so all routes serve `index.html`.
  
