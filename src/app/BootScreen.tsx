import { BrandMark } from "../components/BrandMark";

export function BootScreen() {
  return (
    <main className="boot-screen" aria-label="Opening The HQ" aria-busy="true">
      <div className="boot-screen__content">
        <BrandMark size="large" />
        <div className="boot-screen__progress" aria-hidden="true">
          <span />
        </div>
        <p>Opening The HQ</p>
      </div>
    </main>
  );
}
