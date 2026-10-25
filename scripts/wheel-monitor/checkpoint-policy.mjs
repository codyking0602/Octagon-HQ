// Select a durable GitHub artifact; reports are never grading checkpoints.
// Only promotion artifacts from main are eligible for recovery.
export function selectLatestCheckpointArtifact(artifacts, branch = "main") {
  if (!Array.isArray(artifacts)) throw new Error("Missing GitHub Actions artifact list");
  return artifacts.filter(item =>
    item?.name === "wheel-monitor-snapshot" &&
    item.expired === false &&
    item.workflow_run?.head_branch === branch &&
    Number.isInteger(item.workflow_run?.id) &&
    !Number.isNaN(Date.parse(item.created_at ?? "")) &&
    Number.isInteger(item.id)
  ).sort((left,right) =>
    Date.parse(right.created_at) - Date.parse(left.created_at)
    || right.id - left.id
  )[0] ?? null;
}
