# Portal

Expo (React Native) app with a card-menu Home screen, four screens (Home, Payments, Apply Payment, Settings) and React Native Paper UI.
Runs on Android, iOS and web (which also covers desktop/PC users through the browser).

## Run

| Target | Command |
| --- | --- |
| Android / iOS (Expo Go or dev build) | `npm start`, then press `a` / `i` or scan the QR code |
| Web browser | `npm run web` |
| Web production build | `npm run web:build` → static site in `dist/` |

## Layout

```
src/app/_layout.tsx        Fonts, theme + Redux providers; shows login or the app
src/app/login.tsx          Login screen (calls the login API; you stay signed in after a refresh until you log out or the token expires; "Remember me" pre-fills the username)
src/api/                   API address (config.ts), login request (auth.ts: POST /user/login), payment types + default filter (payments.ts), package search + To Pay rows (packages.ts)
src/store/                 Redux Toolkit store: authSlice.ts (session, login, logout), paymentsSlice.ts (payment picked in the Payments table) and api.ts (RTK Query: cached server data, e.g. GET /payment/filter)
src/app/(app)/_layout.tsx  Top bar (back, logo, user menu with Settings and Log out) for the signed-in pages below
src/app/(app)/index.tsx    Home screen: cards linking to each page (edit the list in src/components/MenuGrid.tsx)
src/app/(app)/payments/index.tsx Payments screen (real payments from the API; server-side search and paging)
src/app/(app)/payments/apply.tsx Apply Payment screen
src/app/(app)/settings.tsx Settings screen (dark mode toggle; opened from the user menu)
src/components/            Home menu cards, top bar, page/card/button building blocks
src/theme/                 Colours, Inter fonts, rounding, shadows (light + dark) + saved dark-mode setting
```

Home shows a card for each page (3 per row on wide screens, 2 on phones); other pages have a back arrow to return.
The app starts in light mode; dark mode can be turned on in Settings and is remembered.
