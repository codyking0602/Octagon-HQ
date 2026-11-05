"""Exercise the actual non-forcing asset branch push/rebase delivery path."""
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("asset_ingest_push_retry.sh")


def git(*args, cwd=None, check=True):
    return subprocess.run(["git", *args], cwd=cwd, check=check,
                          text=True, capture_output=True)


class AssetBranchPushTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.remote = root / "remote.git"
        self.one = root / "one"
        self.two = root / "two"
        git("init", "--bare", str(self.remote))
        git("clone", str(self.remote), str(self.one))
        git("config", "user.email", "ci@example.test", cwd=self.one)
        git("config", "user.name", "CI", cwd=self.one)
        (self.one / "base.txt").write_text("base\n")
        git("add", ".", cwd=self.one)
        git("commit", "-m", "base", cwd=self.one)
        git("branch", "-M", "asset-branch", cwd=self.one)
        git("push", "origin", "asset-branch", cwd=self.one)
        git("clone", "--branch", "asset-branch", str(self.remote), str(self.two))
        git("config", "user.email", "ci@example.test", cwd=self.two)
        git("config", "user.name", "CI", cwd=self.two)

    def test_preserves_parallel_nonconflicting_writers(self):
        (self.one / "first.webp").write_text("first")
        git("add", ".", cwd=self.one)
        git("commit", "-m", "first asset", cwd=self.one)
        git("push", "origin", "asset-branch", cwd=self.one)
        (self.two / "second.webp").write_text("second")
        git("add", ".", cwd=self.two)
        git("commit", "-m", "second asset", cwd=self.two)
        run = subprocess.run(["bash", str(SCRIPT), "asset-branch"],
                             cwd=self.two, text=True, capture_output=True)
        self.assertEqual(run.returncode, 0, run.stderr)
        git("fetch", "origin", "asset-branch", cwd=self.one)
        tree = git("ls-tree", "-r", "--name-only", "origin/asset-branch", cwd=self.one).stdout
        self.assertIn("first.webp", tree)
        self.assertIn("second.webp", tree)

    def test_conflicting_edits_fail_closed(self):
        (self.one / "base.txt").write_text("different A\n")
        git("add", ".", cwd=self.one)
        git("commit", "-m", "change A", cwd=self.one)
        git("push", "origin", "asset-branch", cwd=self.one)
        (self.two / "base.txt").write_text("different B\n")
        git("add", ".", cwd=self.two)
        git("commit", "-m", "change B", cwd=self.two)
        run = subprocess.run(["bash", str(SCRIPT), "asset-branch"],
                             cwd=self.two, text=True, capture_output=True)
        self.assertNotEqual(run.returncode, 0)
        self.assertIn("refusing unsafe push", run.stderr)
        git("fetch", "origin", "asset-branch", cwd=self.two)
        self.assertEqual(git("show", "origin/asset-branch:base.txt", cwd=self.two).stdout,
                         "different A\n")


if __name__ == "__main__":
    unittest.main()
