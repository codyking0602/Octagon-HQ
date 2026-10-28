import importlib.util
import hashlib
import unittest
from pathlib import Path

path=Path(__file__).resolve().parent/"nfl-verified-source-assets.py"
spec=importlib.util.spec_from_file_location("nfl_verified_source_assets",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def fixture():
    resources={name:(b"PAR1"+name.encode()) for name in mod.ASSETS}
    documents={"status":"publisher-assets-recent","sourcePublisherAssetsFresh":True,
               "observedAt":"2026-10-26T02:00:00Z","sources":{}}
    for name,data in resources.items():
        documents["sources"][name]={
          "sourceUrl":"https://github.com/nflverse/nflverse-data/releases/download/"
          +name+"/dataset.parquet",
          "digestSha256":hashlib.sha256(data).hexdigest(),
          "publisherAssetCurrent":True,
          "assetBytes":len(data),
          "publisherUpdatedAt":"2026-10-25T10:00:00Z",
        }
    return documents,resources


class VerifiedAssetTests(unittest.TestCase):
    def test_exact_source_bytes_feed_same_collector_input(self):
        metadata,resources=fixture()
        outputs={}
        result=mod.verify_frames(metadata,lambda k,u:resources[k],
                                 lambda k,data:outputs.setdefault(k,data))
        self.assertEqual(result["sourcesVerified"],3)
        self.assertTrue(result["allSourceByteDigestsMatched"])
        self.assertEqual(outputs,resources)
        self.assertEqual(result["gmContractsChanged"],0)

    def test_tampered_or_truncated_bytes_abort_without_reporting_verified(self):
        metadata,resources=fixture()
        resources["snaps"]=b"bad"
        with self.assertRaisesRegex(ValueError,"byte size mismatch"):
            mod.verify_frames(metadata,lambda k,u:resources[k],lambda k,d:None)
        metadata,resources=fixture()
        resources["snaps"]=b"FAR1snaps"
        with self.assertRaisesRegex(ValueError,"digest mismatch"):
            mod.verify_frames(metadata,lambda k,u:resources[k],lambda k,d:None)

    def test_source_metadata_unavailable_does_not_fall_back_to_query_date(self):
        metadata,resources=fixture()
        metadata["sourcePublisherAssetsFresh"]=False
        with self.assertRaisesRegex(ValueError,"not independently verified"):
            mod.verify_frames(metadata,lambda k,u:resources[k],lambda k,d:None)
        metadata,resources=fixture()
        metadata["sources"]["production"]["publisherAssetCurrent"]=False
        with self.assertRaisesRegex(ValueError,"Missing verified release metadata"):
            mod.verify_frames(metadata,lambda k,u:resources[k],lambda k,d:None)


if __name__=="__main__":
    unittest.main()
