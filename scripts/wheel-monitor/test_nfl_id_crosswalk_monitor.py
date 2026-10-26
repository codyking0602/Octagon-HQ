import importlib.util
import unittest
from pathlib import Path

path=Path(__file__).resolve().parent/"nfl-id-crosswalk-monitor.py"
spec=importlib.util.spec_from_file_location("nfl_id_crosswalk_monitor",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def sources():
    p={"decisionLedgerComplete":True,"decisions":[]}
    s={"decisionLedgerComplete":True,"decisions":[]}
    for i in range(594):
        p["decisions"].append({"sourcePlayerId":f"gsis-{i}"})
        s["decisions"].append({"sourcePfrId":f"pfr-{i}"})
    return p,s


def master():
    rows=[{"gsis_id":f"filler-gsis-{i}","pfr_id":f"filler-pfr-{i}"}
          for i in range(1001)]
    rows.append({"gsis_id":"gsis-0","pfr_id":"pfr-0","espn_id":1234})
    return rows


class CrosswalkTests(unittest.TestCase):
    def test_requires_source_ids_not_player_names(self):
        p,s=sources()
        result=mod.compile_crosswalk(master(),p,s,"now")
        self.assertEqual(result["status"],"read-only-nflverse-player-id-master")
        self.assertEqual(result["requestedGsisIds"],594)
        self.assertEqual(result["requestedPfrIds"],594)
        self.assertEqual(result["mappings"],[{"gsisId":"gsis-0","pfrId":"pfr-0",
                                             "espnId":"1234"}])
        self.assertFalse(result["sourcePublicationFreshnessCertified"])
        self.assertEqual(result["abilityGradesOrContractsChanged"],0)

    def test_duplicate_gsis_or_pfr_causes_hold_not_first_match(self):
        p,s=sources()
        data=master()
        data.append({"gsis_id":"gsis-0","pfr_id":"pfr-new"})
        result=mod.compile_crosswalk(data,p,s,"now")
        self.assertEqual(result["mappings"],[])
        self.assertEqual(result["ambiguousGsisIds"],["gsis-0"])
        data=master()
        data.append({"gsis_id":"gsis-other","pfr_id":"pfr-0"})
        result=mod.compile_crosswalk(data,p,s,"now")
        self.assertEqual(result["mappings"],[])
        self.assertIn("gsis-0",result["ambiguousGsisIds"])

    def test_rejects_truncated_master_and_incomplete_inputs(self):
        p,s=sources()
        with self.assertRaisesRegex(ValueError,"Truncated"):
            mod.compile_crosswalk(master()[:50],p,s,"now")
        s["decisionLedgerComplete"]=False
        with self.assertRaisesRegex(ValueError,"Incomplete"):
            mod.compile_crosswalk(master(),p,s,"now")


if __name__=="__main__":
    unittest.main()
