## Frontend State Persistence & Migration
When modifying seed data or adding new required default entities (e.g., a default user, default category) in an app that uses `localStorage` for state persistence (like Zustand with persist, or manual localStorage access):
- Do NOT assume that updating the `seedData.ts` file is enough. Existing clients' browsers will still load the old state from their `localStorage` and will not see the new seed data.
- ALWAYS inject a small, one-time migration or patch logic at the store initialization level to detect missing critical entities and insert them into the existing `localStorage` state on boot.

## Indonesian POS Business Logic
When building POS or E-commerce apps targeting the Indonesian market:
- **Cash Rounding**: Always implement automatic rounding to the nearest Rp100 for `cash` payment methods (e.g., `Math.round(total / 100) * 100`), because coins smaller than Rp100 are rarely used in physical transactions.
- **Non-Cash**: Do not round non-cash transactions (QRIS, Transfer, Debit) as they can process exact amounts up to the last digit.
- **Data Immutability (Voiding vs Deleting)**: In Enterprise POS systems, transaction data must never be permanently deleted. Voided transactions must be flagged (`isVoided = true`), restore product currentStock, log a StockMutation ('in'), and be recorded in an Audit Log to prevent fraud.
- **Auto Stock Deduction & Mutation Log**: Completing a transaction must deduct `product.currentStock` and add a `StockMutation` ('out') entry automatically.
- **Hardware Barcode Scanner Listener**: Provide a global keyboard listener that catches rapid keystrokes (<50ms buffer ending with Enter) to auto-add matched products directly to cart without requiring manual search focus.
- **Offline Webhook Sync Queue**: Wrap external webhook fetches with a `localStorage` pending queue (`pos_pendingSync`) and automatically flush on `window.addEventListener('online')`.

## Keyboard First Navigation
Cashiers rely heavily on keyboards. Implement virtual numpads connected to keyboard event listeners (e.g., F1-F4 for quick navigation) to boost operational speed.

## Demo Mode Guardrails
When building a public/demo mode, the frontend must have a security layer (Supervisor/Guest Role) that automatically blocks access to Settings, embeds a global transparent Watermark, and provides a 1-Click Factory Reset feature to restore the database from visitor tampering.

## 3D Tilt & Cursor Spotlight UI Pattern
Wrap status metrics, KPI cards, and product catalog items with `InteractiveTiltCard` (`perspective(1000px)` + damped `rotateX`/`rotateY` + `radial-gradient` mouse tracking spotlight) to deliver a tactile, responsive UI experience.

## No Fake "Live" Badges
Do not add decorative "Live" badges, lightning bolts, or fake real-time indicators unless there is an actual real-time connection (like WebSocket) or the user explicitly asks for it. These can cause confusion in applications that only poll or update on refresh.
