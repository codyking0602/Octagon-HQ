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


export function bracketGuideNodes(template: MlbBracketTemplate) {
  const stages: Array<{ league: "AL" | "NL" | null; round: MlbBracketNode["round"] }> = [
    { league: "AL", round: "wild_card" },
    { league: "AL", round: "division_series" },
    { league: "AL", round: "championship_series" },
    { league: "NL", round: "wild_card" },
    { league: "NL", round: "division_series" },
    { league: "NL", round: "championship_series" },
    { league: null, round: "world_series" },
  ];

  return stages.flatMap(({ league, round }) => (
    template.nodes.filter((node) => node.round === round && node.league === league)
  ));
}

function nodeIsPickable(
  template: MlbBracketTemplate,
  node: MlbBracketNode,
  picks: Record<string, string>,
) {
  const [left, right] = nodeParticipants(node, picks, template);
  return Boolean(left && right);
}

export function firstBracketGuideNode(
  template: MlbBracketTemplate,
  picks: Record<string, string>,
  reviewSelected = false,
) {
  const ordered = bracketGuideNodes(template);
  if (reviewSelected) return ordered.find((node) => nodeIsPickable(template, node, picks)) ?? null;
  return ordered.find((node) => nodeIsPickable(template, node, picks) && !picks[node.id])
    ?? ordered.find((node) => nodeIsPickable(template, node, picks))
    ?? null;
}

export function nextBracketGuideNode(
  template: MlbBracketTemplate,
  picks: Record<string, string>,
  currentNodeId: string,
  reviewSelected = false,
) {
  const ordered = bracketGuideNodes(template);
  const index = ordered.findIndex((node) => node.id === currentNodeId);
  const afterCurrent = index >= 0 ? ordered.slice(index + 1) : ordered;

  if (reviewSelected) {
    return afterCurrent.find((node) => nodeIsPickable(template, node, picks)) ?? null;
  }

  return afterCurrent.find((node) => nodeIsPickable(template, node, picks) && !picks[node.id])
    ?? ordered.find((node) => nodeIsPickable(template, node, picks) && !picks[node.id])
    ?? null;
}

export function previousBracketGuideNode(
  template: MlbBracketTemplate,
  picks: Record<string, string>,
  currentNodeId: string,
) {
  const ordered = bracketGuideNodes(template);
  const index = ordered.findIndex((node) => node.id === currentNodeId);
  if (index <= 0) return null;
  return ordered.slice(0, index).reverse().find((node) => nodeIsPickable(template, node, picks)) ?? null;
}
