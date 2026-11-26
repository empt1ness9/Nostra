<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Nostra rules
- Money/progress/subscription rules and date helpers live in src/lib/rules.ts, tested in src/test/rules.test.ts; why: one tested source for business rules.
- Data is read/written from the browser via the Cloud client with RLS (hooks in src/lib/data.ts); access to a student card = tutor_id, student_user_id or parent_user_id (can_access_student); why: simple, RLS enforces who sees what.
- Account type (tutor/student/parent) lives in user_roles; students/parents link to a card with its invite code via claim_invite; parents mark payment via parent_mark_paid (pending → tutor confirms); why: no self-escalation, tutor stays in control of money.
- Auth gate is in __root (Gate → AuthScreen); the header tabs depend on role; why: every page needs a signed-in user.
- Parent meetings are lessons with kind='parent': free and excluded from progress; why: owner's 'separate hour with parent' feature.
- Progress = percent of attended lessons among held or missed ones; debt counts only held unpaid lessons; why: product definition from the owner.
- App is dark-themed by default (tokens in :root of src/styles.css), fonts Inter + Unbounded (logo); why: matches the owner's HTML mockup.
- Shared top navigation lives in src/components/AppHeader.tsx rendered from __root; why: one header for every tutor page.
- Tutor payment details, defaults and QR live in tutor_settings (readable by linked student/parent); QR images in the private "qr" storage bucket under <tutor_id>/, shown via signed URLs; why: workspace blocks public buckets.
- Topics per student in topics table; homework is a field on lessons, students mark it via student_mark_homework; why: mockup's "темы и ДЗ" features.
