# Royal Signature Guest Use Cases

## 1. Discover a room

**Actor:** Guest  
**Precondition:** Published room types and active rates are available.

1. Open the home page or choose **Rooms & Suites** from navigation.
2. Search or filter the published room catalogue by room name, type, bed, capacity, and price.
3. Open a room to review its description, rate, policies, and guest reviews.

**Expected result:** The guest sees published Royal Signature data and supplied photographs where available. Missing photographs use the branded placeholder. Rates are starting prices and remain subject to confirmation.

## 2. Check stay availability

**Actor:** Guest  
**Precondition:** Stay dates are available for selection.

1. Enter check-in and check-out dates and choose guest counts.
2. Submit the availability search.
3. Review matching room inventory and the quoted stay total.

**Expected result:** Both dates are required and check-out must follow check-in. Availability and pricing are checked against current room, rate, and inventory records.

**Current limitation:** No physical accommodation units are configured, so the current CMS cannot return a bookable stay.

## 3. Continue to checkout

**Actor:** Guest  
**Precondition:** Availability returned a room and a valid rate for the selected dates.

1. Continue from an availability result to checkout.
2. Review the room, dates, guest details, and confirmed booking total.
3. Submit the booking request to create a temporary booking hold.
4. Choose a configured payment provider to continue payment.

**Expected result:** Checkout uses the validated room and stay details. Opening checkout without the required room, rate, and date parameters shows a recovery link back to availability search rather than a permanent loader.

**Current limitation:** A complete checkout or payment was not tested because physical inventory and live payment credentials are unavailable.

## 4. Submit a guest review

**Actor:** Guest  
**Precondition:** At least one published room or suite is available to select.

1. Open **Guest Reviews** and choose **Leave a review**.
2. Provide a name, email, title, room, rating, and review text.
3. Submit the review.
4. Wait for the hotel to moderate it.

**Expected result:** Required fields are validated. A valid review is held for approval and is not displayed publicly until approved. Public review lists expose approved reviews only.

**Current limitation:** There are no approved public reviews. Validation covered the empty-form guard and rating filter; no review was submitted during testing.

## 5. Find contact information

**Actor:** Guest

1. Open **Contact** from navigation or the footer.
2. Review the published Ojo Road area and map.
3. Use the available hotel contact details when confirmed by the hotel.

**Expected result:** The page presents location information without a contact form. Unconfirmed phone, email, office hours, and exact map pin are identified as pending rather than invented.

## 6. Use the site on a mobile device

**Actor:** Guest

1. Open the site at a narrow viewport.
2. Open the navigation menu and select a destination.
3. Browse rooms, reviews, contact details, and booking controls.

**Expected result:** Navigation opens accessibly, forms and content fit the viewport, and the tested 390-pixel layout has no horizontal page overflow.

