# Native sharing scope

Octagon HQ uses one native-share owner for:

- fighter profiles;
- fighter comparisons;
- Picks recaps;
- reproducible Play challenge invitations;
- completed profile-matchup results.

The owner opens the platform share sheet with an exact Octagon HQ link. When native sharing is unavailable or fails, it copies that exact link instead. Cancelling the platform share sheet does not trigger an unwanted copy.

The rollout reuses the existing fighter-profile, Picks recap, and Text / Share Link actions, adds one Share Matchup action to Compare, and adds Share Results to the existing completed matchup dialog.

Canonical `/play?challenge=:challengeCode` links stay with the existing Challenge Center owner. Received links open the exact locked game, completed links open the exact matchup result, and waiting or declined links focus the appropriate Challenge Center state.

Solo result screens are intentionally not presented as externally persistent result records. Their exact reproducible game setup remains shareable through Challenge Someone without creating a second result repository.
