# Roadmap

## Admin dashboard (done)
- [x] Cloud auth: /auth sign-in page (email+password, Google), admin role gate
- [x] DB: user_roles + has_role, enquiries, content_blocks, media_assets
- [x] /admin under _authenticated with first-admin claim
- [x] Enquiries & enrollments manager (list, filter, status, notes, delete)
- [x] Page content editor (bilingual EN/TA blocks)
- [x] Media library (upload to private storage, signed preview, copy link, delete)
- [x] User management (list users, grant/revoke admin & editor)
- [x] Wire public contact/enroll forms to save enquiries in DB

## Later
- [ ] Render content_blocks on public pages
- [ ] /ta/... localized routes, hreflang, analytics

## Buy page & payments (in progress)
- [ ] Per-program prices (waiting on user amounts)
- [ ] /buy page: program select, terms checkbox with T&C text, Stripe + Razorpay options
- [ ] Add T&C text to /terms page
- [ ] Razorpay integration (waiting on user keys)
- [x] Buy page at /buy (program select, T&C, card + Razorpay buttons); T&C added to /terms
