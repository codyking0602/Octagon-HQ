import { readFileSync, writeFileSync } from "node:fs";

const path = ".github/workflows/verify-generalized-daily-backend.yml";
const text = readFileSync(path, "utf8");
const startMarker = "classify-backend-deployment:\n";
const exactMarker = "exact-deployment-proof:\n";
const start = text.indexOf(startMarker);
const exact = text.indexOf(exactMarker, start);
const end = text.indexOf("    runs-on: ubuntu-latest\n", exact);

if (start < 0 || exact < 0 || end < 0) {
  throw new Error("Could not locate the malformed backend verification job block.");
}

const replacement = `  classify-backend-deployment:
    if: github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    timeout-minutes: 3
    outputs:
      deployed: \${{ steps.inspect.outputs.deployed }}
    steps:
      - name: Check whether the canonical workflow actually deployed Supabase
        id: inspect
        uses: actions/github-script@v7
        env:
          DEPLOY_RUN_ID: \${{ github.event.workflow_run.id }}
        with:
          script: |
            const runId = Number(process.env.DEPLOY_RUN_ID);
            const { data } = await github.rest.actions.listJobsForWorkflowRun({
              owner: context.repo.owner,
              repo: context.repo.repo,
              run_id: runId,
              per_page: 100,
            });
            const deployed = data.jobs.some((job) => (
              job.name === "deploy"
              && job.status === "completed"
              && job.conclusion === "success"
            ));
            core.setOutput("deployed", deployed ? "true" : "false");
            core.info(deployed
              ? "Canonical Supabase deploy job ran successfully; exact deployment proof is required."
              : "Backend release was unchanged; skipping Supabase post-deploy proof.");

  exact-deployment-proof:
    needs: classify-backend-deployment
    if: \${{ github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success' && needs.classify-backend-deployment.outputs.deployed == 'true' }}
`;

writeFileSync(path, text.slice(0, start) + replacement + text.slice(end));
