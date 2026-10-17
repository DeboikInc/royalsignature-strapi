# Royal Signature Launch Confirmation Checklist

## Supplied starting room data

The seed contains exactly five supplied accommodation types and starting NGN rates: Classic Room (25,000), Executive Room (30,000), Deluxe Room (40,000), Super Royal (50,000), and Apartment Amsterdam's (100,000). These amounts are not verified live rates. Confirm rate applicability, taxes, fees, occupancy rules, child age rules, and extra-person charges before production.

The listed capacities and beds reflect the project brief. Confirm them with the hotel. Floor areas (25, 32, 40, 45 and 85 m² respectively) were described as suggestions and are not seeded or published as facts. Complimentary breakfast for Super Royal and Apartment Amsterdam's remains unconfirmed and disabled.

## Required before accepting real bookings

- Confirm room category inventory and create one active Strapi Accommodation Unit for each independently rentable physical room. Confirm unit codes, capacity limits, blackout dates and operational availability.
- Confirm all rates, currency, seasonal dates/prices, minimum/maximum stay, taxes, service charges, deposits, refund/cancellation terms and check-in/check-out hours.
- Confirm the five room descriptions, capacities, bed configurations, room sizes, and which suggested room amenities actually exist.
- Confirm whether restaurant, lounge, room service, bar, event/meeting rooms, catering, parking, power, Wi-Fi and other facilities are available; configure only approved amenity relations.
- Provide hotel-owned photography for exterior/entrance, reception, each room type, restaurant/dining, lounge and verified events/amenities. Confirm usage rights and provide the approved logo mark/wordmark as local image files.
- Confirm phone number, guest-service email, front-desk hours, exact map coordinates, social account URLs and any emergency contact. The current contact form does not send messages until a delivery provider is configured.
- Approve the proposed mission and vision wording, final about copy, privacy notice, terms, cookie/analytics policy and review moderation process.
- Confirm domain ownership and DNS access for `royalssignaturehotelandsuites.com`; configure canonical URL and production CORS after verification.
- Provision unique production Strapi secrets/API token, MariaDB credentials, private media storage, backups, monitoring and independently managed Paystack credentials/webhooks. Begin with provider test credentials; authorize live payment enablement separately.

## Current unverified or unavailable behavior

- No physical inventory is seeded, so search correctly returns no bookable rooms. A live hold, concurrent booking, or real checkout could not be tested.
- Contact form submission explicitly reports that no message was sent; connect and test a hotel-approved mail/ticket service.
- Paystack keys and webhook endpoint are not provisioned. Unit tests validate signature and amount/reference logic only; no provider request or live payment was made.
- The approved logo artwork is visible in the supplied brief but was not available as local file data during project creation; the current RS treatment is temporary.
- Stock hotel imagery is illustrative, labeled as such, and must be replaced by approved property photographs.
- Docker/MariaDB isolation, Strapi admin creation, database seed idempotency against a live Strapi instance, production deployments, DNS and backups remain unverified.