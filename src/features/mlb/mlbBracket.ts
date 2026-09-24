import type { MlbBracketNode, MlbBracketSlot, MlbBracketTemplate, MlbTeam } from "./mlbPlayoffsRepository";

export function teamById(template: MlbBracketTemplate, id: string | null | undefined): MlbTeam | null {
  if (!id) return null;
  return template.teams.find((team) => team.id === id) ?? null;
}

export function slotTeamId(
  slot: MlbBracketSlot,
  picks: Record<string, string>,
): string | null {
  if (slot.teamId) return slot.teamId;
  if (slot.sourceNodeId) return picks[slot.sourceNodeId] ?? null;
  return null;
}

export function nodeParticipants(
  node: MlbBracketNode,
  picks: Record<string, string>,
  template: MlbBracketTemplate,
) {
  return [
    teamById(template, slotTeamId(node.left, picks)),
    teamById(template, slotTeamId(node.right, picks)),
  ] as const;
}

export function sanitizeBracketPicks(
  template: MlbBracketTemplate,
  candidate: Record<string, string>,
) {
  const next: Record<string, string> = {};
  for (const node of template.nodes) {
    const [left, right] = nodeParticipants(node, next, template);
    const pick = candidate[node.id];
    if (pick && (pick === left?.id || pick === right?.id)) next[node.id] = pick;
  }
  return next;
}

export function bracketComplete(template: MlbBracketTemplate, picks: Record<string, string>) {
  return template.nodes.length > 0
    && template.nodes.every((node) => {
      const [left, right] = nodeParticipants(node, picks, template);
      return Boolean(left && right && picks[node.id] && (picks[node.id] === left.id || picks[node.id] === right.id));
    });
}
