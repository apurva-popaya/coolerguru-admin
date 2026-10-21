# Admin plans and billing prototype

The admin UI currently uses sample data only. No new backend calls are made.

## Screens to review

- `/plans`: plan catalog; All/Active/Inactive filters, search, view, edit, and activation confirmation.
- `/plans/create`: create form with field validation and seller card preview.
- `/plans/{planId}/edit`: edit form. Changes affect the local catalog only.
- `/billing`: Subscriptions, Payments, and Invoices tabs with company, plan, status, search, and date filters.
- `/billing?company=8`: sample company filter. `tab=payments` and `tab=invoices` select those tabs.
- Existing company detail pages: Plan & Billing section. Sample company IDs are `8`, `1`, and `19`.
- Use each billing row's View action for subscription/payment detail panels and the invoice preview.

Fixtures use 19 October 2026 as the reference date. Expiring soon means an active subscription
expiring from 19 through 26 October, inclusive. Other dates and summary values are derived from the fixtures.

## Data boundaries

- `src/lib/billing-demo.ts`: typed plan, company, subscription, payment, and invoice fixtures.
- `src/lib/plan-demo-store.ts`: browser-local plan create/edit/status changes, under
  `coolerguru-demo-plans-v1` in local storage. Removing this key restores the original catalog.
- Billing records deliberately retain snapshots of purchased prices and limits when catalog plans change.
- Invoice downloads are sample HTML files marked as UI previews, not backend-issued tax invoices.
- Company IDs in these fixtures are illustrative; no billing state is inferred from live company APIs.

## Backend data needed

| Resource | Required information |
| --- | --- |
| Plan catalog | ID, name, unique slug, description, price, currency, duration or no-expiry flag, product/user limits, display order, active state |
| Subscription | ID, company/seller, purchased plan snapshot, request/start/expiry dates, status, usage, related payment and invoice IDs |
| Payment | Internal payment/order IDs, Razorpay payment/order IDs, company, plan, amount/currency, method, status, timestamps, failure reason, refund information, related subscription/invoice IDs |
| Invoice | ID, issued number/date, company billing details, issuer details, line items, subtotal, tax breakdown, total/currency, document status, payment reference, document download URL |
| Billing summary | Active subscriptions, expiring-soon count, captured payment total/currency for the selected scope |
| Company billing | Current subscription with allowances/usage, recent subscription/payment/invoice records |

Lists need pagination, total counts, company/plan/status/date filters, and search by the references shown in the UI.
Subscription date filters currently use the start/request date; payment filters use the attempt date;
invoice filters use the issue date, falling back to payment date while generating. Confirm these semantics
with the backend before integration. Summaries use company, plan, search, and date scope, excluding table status filters.

## Mutation behavior

- Create and edit plans; enforce unique slugs and validation server-side.
- Activate/deactivate plans with confirmation. Deactivation prevents new purchases, while existing terms continue.
- Preserve subscription snapshots and issued invoices when a catalog plan changes.
- Payment verification remains the source of subscription activation; there are no manual activation or Mark paid controls.
- Invoice generation is distinct from successful payment. Do not enable document downloads until a document is ready.
- Keep plan, subscription, payment, and invoice status fields independent.
- Reuse the existing ADMIN authentication, proxy, and server authorization patterns during API integration.

Replace local persistence and fixture selectors with API adapters, add loading/error states around those requests,
and replace the sample HTML download with the backend document URL. No endpoint names have been assumed here.
