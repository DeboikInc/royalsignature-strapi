# Royal Signature UI and Release Validation Report

## Summary

The Royal navy, champagne-gold, ivory, and charcoal palette is applied to the shared shell and the room, review, and contact experiences. The Rooms & Suites catalogue places its filters beside a two-column card grid on desktop and stacks on mobile. Official Royal Signature photos fill unpopulated room-image relationships as local fallbacks and appear on the Gallery page. The supplied crest is used by loading states, and the supplied full mark is used in the footer. The room-detail related-properties section has been removed. Direct checkout without the required stay details now presents a recovery message instead of an indefinite loading state.

## Validation

| Check | Result |
| --- | --- |
| Frontend lint (`npm run lint`) | Passed with no ESLint warnings or errors |
| Isolated production build (`npm run build`) | Passed; compilation, lint/type checks, static generation, and trace collection completed |
| Backend tests (`npm run test --prefix backend`) | Passed: 17/17 |
| Production route smoke test | Passed: 20 current and legacy page URLs returned HTTP 200 after redirects |
| Unknown route handling | Passed: HTTP 404 |
| Removed contact API | Passed: `/api/contact` returns HTTP 404 |
| Brand image requests | Passed: loader crest and footer mark both return HTTP 200 and render |
| Desktop UI | Passed on home, rooms, room details, reviews, and contact |
| Mobile UI | Passed at 390×844 on home, rooms, room details, reviews, contact, booking, and checkout; no horizontal overflow |
| Review interactions | Required fields block an empty submission; the 5-star filter updates the result heading |
| Room interactions | Pricing tab switches correctly; the availability form requires both dates |
| Booking interactions | Empty availability search is blocked until both dates are supplied |
| Mobile navigation | Menu opens and updates its expanded state |
| Room catalogue layout and filtering | Passed: desktop sidebar and two-column grid; 390px mobile layout stacks without horizontal overflow; room-type filtering and clear/reset preserve all five CMS listings |
| Room media and public gallery | Passed: all eight local photos return HTTP 200; five room cards, room-detail fallback, and eight-image Gallery render |
| Browser runtime exceptions | None observed |

Review testing did not submit a valid review, booking, or payment. No test records were written to the hotel database.

## Environment and warnings

The production build was created in a temporary isolated directory to avoid replacing the active development build. It completed with non-blocking warnings about stale Browserslist data, the project's missing Tailwind content configuration, and Node's deprecated `punycode` module.

## Known data and release constraints

- Five published room types and starting rates are available, but physical room inventory is not configured. Live availability and a complete booking hold therefore cannot be verified.
- The Strapi room image relationships are still empty. Room cards and room details now use category-matched local hotel photos as fallbacks, and the Gallery page displays those five room photos plus three supplied hotel-interior photos.
- Checkout and payment-provider transactions were not exercised; live payment credentials and a bookable unit are required.
- Contact details such as the hotel phone, email, and front-desk hours remain unconfirmed. The map shows the general Ojo area, not a verified hotel pin.
- The contact form and its submission endpoint have been removed as requested.
