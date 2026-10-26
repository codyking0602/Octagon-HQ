import importlib.util
import unittest
from pathlib import Path

path=Path(__file__).resolve().parent/"nfl-production-monitor.py"
spec=importlib.util.spec_from_file_location("nfl_production_monitor",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def population():
    return {"teams":{f"T{i:02}":{"QB":[f"Filler {i}-{j}" for j in range(18)]}
                     for i in range(33)}}

def game(week,yards=280,attempts=40,player_id="gsis-one",name="Filler 0-0",team="T00"):
    return {"season":2026,"season_type":"REG","week":week,"team":team,
            "player_display_name":name,"player_id":player_id,
            "passing_yards":yards,"attempts":attempts}

class ProductionTests(unittest.TestCase):
    def test_real_sustained_change_queues_review_without_regrading(self):
        rows=[game(w,yards=280 if w<=3 else 480) for w in range(1,7)]
        report=mod.review_production_evidence(rows,2026,population(),"now")
        self.assertEqual(report["counts"]["priority-performance-review"],1)
        self.assertEqual(report["counts"]["unobserved"],593)
        self.assertEqual(report["priorityPerformanceReview"][0]["recentMetric"],12.0)
        self.assertEqual(report["abilityGradesChanged"],0)
        self.assertFalse(report["detailedReviewAvoidanceCertified"])
        self.assertEqual(report["fullApprovedNflDenominator"],626)

    def test_single_outlier_never_triggers_an_ability_review(self):
        rows=[game(w,yards=280 if w<6 else 640) for w in range(1,7)]
        report=mod.review_production_evidence(rows,2026,population(),"now")
        self.assertEqual(report["counts"]["priority-performance-review"],0)
        self.assertEqual(report["counts"]["no-sustained-metric-shift"],1)

    def test_two_absent_games_or_low_opportunities_prevent_certification(self):
        rows=[game(w,attempts=4) for w in range(1,7)]
        report=mod.review_production_evidence(rows,2026,population(),"now")
        self.assertEqual(report["counts"]["insufficient-metric"],1)
        self.assertEqual(report["multiweekMetricCoverage"],0)

    def test_reused_name_with_multiple_source_ids_is_an_identity_hold(self):
        rows=[game(w,player_id=("A" if w<=3 else "B")) for w in range(1,7)]
        report=mod.review_production_evidence(rows,2026,population(),"now")
        self.assertEqual(report["counts"]["identity-review"],1)

    def test_missing_defensive_fields_are_not_a_zero_performance_signal(self):
        priorities=population()
        priorities["teams"]["T00"]["QB"].pop()
        priorities["teams"]["T00"]["Front Seven"]=["Defensive Filler"]
        rows=[game(w,name="Defensive Filler",player_id="def") for w in range(1,7)]
        report=mod.review_production_evidence(rows,2026,priorities,"now")
        self.assertEqual(report["counts"]["insufficient-metric"],1)
        self.assertEqual(report["counts"]["priority-performance-review"],0)

    def test_reject_untrusted_population_and_unusable_weekly_data(self):
        wrong=population()
        wrong["teams"]["T00"]["QB"].pop()
        with self.assertRaisesRegex(ValueError,"594"):
            mod.review_production_evidence([game(1),game(2)],2026,wrong,"now")
        with self.assertRaisesRegex(ValueError,"minimum coverage"):
            mod.review_production_evidence([game(1)],2026,population(),"now")

if __name__=="__main__":
    unittest.main()
