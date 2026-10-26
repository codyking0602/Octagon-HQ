import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

path=Path(__file__).resolve().parent/"nfl-snap-monitor.py"
spec=importlib.util.spec_from_file_location("nfl_snap_monitor",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def priorities():
    teams={}
    for i in range(33):
        team=f"T{i:02}"
        teams[team]={"QB":[f"Filler {i}-{j}" for j in range(18)]}
    return {"teams":teams}


def sample(name="Filler 0-0",team="T00",share=0.7,week=1,player_id="xyz"):
    return {"season":2026,"game_type":"REG","week":week,"team":team,
            "player":name,"pfr_player_id":player_id,
            "offense_pct":share,"defense_pct":0}


class NflSnapReviewTests(unittest.TestCase):
    def test_sustained_usage_change_requires_two_games_in_each_window(self):
        rows=[sample(share=v,week=i+1) for i,v in
              enumerate([.2,.2,.2,.75,.8,.7])]
        out=mod.review_snap_evidence(rows,2026,priorities(),"2026-10-25T00:00Z")
        self.assertEqual(out["playerPopulation"],594)
        self.assertEqual(out["summary"]["priority-factual-review"],1)
        self.assertEqual(out["abilityEvaluationsPerformed"],0)
        self.assertFalse(out["detailedReviewAvoidanceCertified"])
        self.assertEqual(out["priorityReviews"][0]["changePercentagePoints"],55.0)

    def test_one_weird_game_does_not_trigger_review(self):
        rows=[sample(share=v,week=i+1) for i,v in
              enumerate([.2,.2,.2,.2,.2,.75])]
        out=mod.review_snap_evidence(rows,2026,priorities(),"now")
        self.assertEqual(out["summary"]["priority-factual-review"],0)
        self.assertEqual(out["summary"]["no-usage-shift-detected"],1)

    def test_no_data_and_same_team_colliding_ids_are_not_stable(self):
        rows=[sample(share=.2,week=1),
              sample(share=.2,week=2,player_id="different")]
        out=mod.review_snap_evidence(rows,2026,priorities(),"now")
        self.assertEqual(out["summary"]["identity-review"],1)
        self.assertEqual(out["summary"]["unobserved"],593)
        self.assertEqual(out["strictWindowCoverage"],0)

    def test_source_completeness_and_safeguards(self):
        self.assertEqual(mod.name_key("José Rodríguez Jr."),"joserodriguez")
        self.assertEqual(mod.percent(.65),65)
        self.assertRaises(ValueError,mod.percent,120)
        with self.assertRaisesRegex(ValueError,"too short"):
            mod.review_snap_evidence([sample(week=1)],2026,priorities(),"now")
        wrong=priorities()
        wrong["teams"]["T00"]["QB"].pop()
        with self.assertRaisesRegex(ValueError,"census"):
            mod.review_snap_evidence([sample(week=1),sample(week=2)],
                                     2026,wrong,"now")


if __name__=="__main__":
    unittest.main()
