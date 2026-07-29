# War Room Access Foundation

## Product contract

War Room is Octagon HQ's private social layer. The final eligible-member primary navigation order is:

**Home → Rankings → Picks → Play → War Room**

Signed-out and unauthorized users must not discover War Room through navigation, routes, Home, notifications, or placeholder content. A valid invite may lead a person into a future **Join with Invite** flow, but it never exposes conversation data before access is granted.

## PR 1 boundary

This slice creates only the server-owned access foundation:

- private War Room memberships;
- private, hashed, expiring, usage-limited invites;
- one authenticated access-status RPC;
- one authenticated join-with-invite RPC;
- service-role-only invite creation/revocation and membership management;
- focused migration and rollback contracts.

No route, tab, page, provider, badge, feed, or placeholder is added in this PR.

## Ownership

- Supabase owns membership and invite truth.
- Existing `IdentityProvider` remains the only browser identity owner.
- Future War Room UI must consume the resolved `auth.uid()` session and these RPCs.
- The browser must never read War Room access tables directly.
- Invite raw codes are returned once by the service-role creation RPC and are never stored.
- A revoked membership cannot be restored by presenting a generic invite.

## Later slices

PR 2 will add the guarded conversation core. PR 3 will add unread/realtime ownership and conditionally expose the final navigation destination after the complete experience is ready.
