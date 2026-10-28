-- NBA Sports Feud is an official Daily game, not a Casual game.
-- Retire the 202612310320 Casual RPCs immediately without deleting any
-- historical owner-preview reservation rows. Daily boards are globally
-- deterministic by published appearance ordinal and require no player table.
revoke execute on function public.get_nba_feud_casual_rotation() from authenticated;
revoke execute on function public.reserve_nba_feud_casual_pack(text[], text[], boolean) from authenticated;
comment on table public.nba_feud_casual_rotation is
  'Retired NBA Sports Feud Casual owner-preview history; never used by official Daily. No client access.';
notify pgrst, 'reload schema';
