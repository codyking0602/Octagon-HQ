import { useState, type FormEvent } from "react";
import {
  type CrownsCard, type CrownsData, type CrownsSeries,
  cardLabel, createCrownsRow, humanize, updateCrownsRow, uploadCardFace,
} from "./crownsData";

type StudioTab = "cards" | "subjects" | "designs" | "variants" | "production";
const statuses = ["planned", "designing", "finished", "printed"];
const kinds = ["person", "athlete", "character", "event", "group", "other"];

function field(form: FormData, name: string) { return String(form.get(name) ?? "").trim(); }
function optional(form: FormData, name: string) { return field(form, name) || null; }
function numberOrNull(form: FormData, name: string) { return field(form, name) ? Number(field(form, name)) : null; }

export default function CrownsStudio({
  data, refresh, urls, initialCardId = 0,
}: {
  data: CrownsData; refresh: () => Promise<void>; urls: Record<string, string>; initialCardId?: number;
}) {
  const [tab, setTab] = useState<StudioTab>("cards");
  const [cardId, setCardId] = useState(initialCardId);
  const [cardSearch, setCardSearch] = useState("");
  const [subjectId, setSubjectId] = useState(0);
  const [seriesSlug, setSeriesSlug] = useState("");
  const [variantId, setVariantId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");

  const card = data.cards.find(item => item.id === cardId) || data.cards[0] || null;
  const subject = data.subjects.find(item => item.id === subjectId) || data.subjects[0] || null;
  const series = data.series.find(item => item.slug === seriesSlug) || data.series[0] || null;
  const cardVariants = data.variants.filter(item => item.card_id === card?.id);
  const variant = cardVariants.find(item => item.id === variantId) || cardVariants[0] || null;
  const cardCopies = data.copies.filter(item => item.card_id === card?.id);
  const ownerTask = async (task: () => Promise<void>, success: string) => {
    if (busy) return;
    setBusy(true); setFailure(""); setMessage("");
    try { await task(); await refresh(); setMessage(success); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : "The change could not be saved."); }
    finally { setBusy(false); }
  };
  const submit = (event: FormEvent<HTMLFormElement>, task: (form: FormData) => Promise<void>, success: string) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    void ownerTask(() => task(fields), success);
  };
  const selection = (id: number) => setCardId(id);
  const visibleCards = data.cards.filter(item => {
    if (item.id === card?.id) return true;
    const term = cardSearch.trim().toLocaleLowerCase();
    if (!term) return true;
    const subject = data.subjects.find(s => s.id === item.subject_id);
    return [subject?.name, item.title, item.classification, item.source_row?.toString()]
      .some(value => value?.toLocaleLowerCase().includes(term));
  });
  const options = visibleCards.map(item =>
    <option key={item.id} value={item.id}>{cardLabel(item, data.subjects)}{item.source_row ? ` · row ${item.source_row}` : ` · #${item.id}`}</option>
  );
  const upload = async (target: "cards" | "variants", id: number, side: "front" | "back", file?: File) => {
    if (!file) return;
    await ownerTask(() => uploadCardFace(target, id, side, file).then(() => undefined), `${side} image uploaded.`);
  };
  const faceUpload = (target: "cards" | "variants", id: number, side: "front" | "back", currentPath: string | null) => (
    <label className="crowns-upload">
      <strong>{side.toUpperCase()} IMAGE</strong>
      <small>{currentPath ? "Replace Canva artwork" : "Upload Canva artwork"} · PNG / JPG / WebP</small>
      {currentPath && urls[currentPath] && <img src={urls[currentPath]} alt={`Current ${side}`} />}
      <input type="file" accept="image/png,image/jpeg,image/webp,image/avif"
        disabled={busy} onChange={e => { const file = e.currentTarget.files?.[0]; void upload(target, id, side, file); e.currentTarget.value = ""; }} />
    </label>
  );

  return (
    <section className="crowns-studio">
      <header className="crowns-page-intro"><span className="crowns-eyebrow">PRIVATE OWNER WORKSPACE</span><h1>CROWNS Studio</h1>
        <p>Organize the catalog, assign your designs, manage variants, and upload finished Canva cards. This workspace is never public.</p></header>
      <div className="crowns-stats crowns-stats--studio">
        <div><strong>{data.cards.length}</strong><span>CARD SLOTS</span></div>
        <div><strong>{data.cards.filter(item => !item.series_slug).length}</strong><span>UNASSIGNED</span></div>
        <div><strong>{data.cards.filter(item => item.status === "designing").length}</strong><span>DESIGNING</span></div>
        <div><strong>{data.copies.filter(item => item.status === "in-hand").length}</strong><span>PHYSICAL COPIES</span></div>
      </div>
      <div className="crowns-studio-tabs" role="tablist" aria-label="Studio tools">
        {([
          ["cards","Cards"],["subjects","Subjects"],["designs","Designs & Series"],
          ["variants","Parallels"],["production","Production"],
        ] as [StudioTab,string][]).map(([key,name])=>
          <button type="button" role="tab" aria-selected={tab===key} className={tab===key?"is-current":""}
            onClick={()=>{setTab(key);setMessage("");setFailure("");}} key={key}>{name}</button>)}
      </div>
      {failure && <div className="crowns-alert crowns-alert--error" role="alert">{failure}</div>}
      {message && <div className="crowns-alert" role="status">{message}</div>}

      {tab === "cards" && (
        <div className="crowns-studio-grid">
          <section className="crowns-panel">
            <h2>Card editor</h2>
            <p>Every workbook row is a separate planning slot, including intentional repeats.</p>
            <label>FIND CARD<input type="search" value={cardSearch} onChange={e=>setCardSearch(e.target.value)} placeholder="Search names, sports or row number" /></label>
            <label>SELECT A CARD
              <select value={card?.id ?? ""} onChange={e=>selection(Number(e.target.value))}>{options}</select>
            </label>
            {card && <form key={card.id} onSubmit={e=>submit(e, async f=>{
              const subjectName = data.subjects.find(s=>s.id===card.subject_id)?.name || "";
              const target = optional(f,"series_slug");
              if (target === "the-one-the-only" && !["Conor McGregor","Jon Jones"].includes(subjectName))
                throw new Error("The One, The Only is reserved for Conor McGregor and Jon Jones.");
              await updateCrownsRow("crowns_cards","id",card.id,{
                title:optional(f,"title"),series_slug:target,
                template_id:numberOrNull(f,"template_id"),
                status:field(f,"status"),notes:optional(f,"notes"),
                orientation_override:optional(f,"orientation_override"),
                intended_print_qty:Number(field(f,"intended_print_qty")||0),
                legacy:f.has("legacy"),legacy_reason:optional(f,"legacy_reason"),
                is_published:f.has("is_published"),
                updated_at:new Date().toISOString(),
              });
            },"Card saved.")}>
              <div className="crowns-form-pair">
                <label>SUBJECT<input value={data.subjects.find(s=>s.id===card.subject_id)?.name??""} readOnly/></label>
                <label>PROGRESS STATUS<select name="status" defaultValue={card.status}>{statuses.map(s=><option key={s} value={s}>{humanize(s)}</option>)}</select></label>
              </div>
              <label>DISPLAY TITLE (OPTIONAL)<input name="title" defaultValue={card.title??""} placeholder="Defaults to the subject's name"/></label>
              <label>DESIGN / SERIES<select name="series_slug" defaultValue={card.series_slug??""}>
                <option value="">Not assigned yet</option>
                {data.series.filter(s=>s.slug!=="the-one-the-only"||["Conor McGregor","Jon Jones"].includes(data.subjects.find(x=>x.id===card.subject_id)?.name??""))
                  .map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select></label>
              <label>CANVA TEMPLATE<select name="template_id" defaultValue={card.template_id??""}>
                <option value="">No template linked</option>{data.templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select></label>
              <div className="crowns-form-pair">
                <label>ORIENTATION<select name="orientation_override" defaultValue={card.orientation_override??""}>
                  <option value="">Use series default</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option>
                </select></label>
                <label>PLANNED PRINTS<input name="intended_print_qty" type="number" min="0" defaultValue={card.intended_print_qty} /></label>
              </div>
              <label>NOTES<textarea name="notes" rows={3} defaultValue={card.notes??""} placeholder="Photo concept, milestones, design details…"/></label>
              <label className="crowns-check"><input type="checkbox" name="legacy" defaultChecked={card.legacy}/> LEGACY designation</label>
              <label>LEGACY ACHIEVEMENT<input name="legacy_reason" defaultValue={card.legacy_reason??""} placeholder="Why this card qualifies"/></label>
              <label className="crowns-check"><input type="checkbox" name="is_published" defaultChecked={card.is_published}/> Mark ready for future public gallery</label>
              <button className="crowns-action" type="submit" disabled={busy}>SAVE CARD</button>
              {card.source_row&&<small className="crowns-source-note">Original workbook: {card.source_sheet}, row {card.source_row} · Code {card.legacy_design_code??"—"} · {card.requested_by||"No requester"}</small>}
            </form>}
          </section>
          <section className="crowns-panel">
            <h2>Card images</h2><p>Upload full-resolution Canva exports. The image orientation is preserved without cropping.</p>
            {card && <div className="crowns-upload-grid">
              {faceUpload("cards",card.id,"front",card.front_path)}
              {faceUpload("cards",card.id,"back",card.back_path)}
            </div>}
            <h2>Create another card</h2><p>One subject can have as many distinct card designs as you choose.</p>
            <form onSubmit={e=>submit(e,async f=>{
              await createCrownsRow("crowns_cards",{subject_id:Number(field(f,"subject_id")), status:"planned"});
            },"New planned card added.")}>
              <label>SUBJECT<select name="subject_id" defaultValue={data.subjects[0]?.id}>
                {data.subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
              <button className="crowns-action crowns-action--outline" type="submit" disabled={busy}>+ ADD PLANNED CARD</button>
            </form>
          </section>
        </div>
      )}

      {tab === "subjects" && (
        <div className="crowns-studio-grid">
          <section className="crowns-panel">
            <h2>Subject library</h2><p>{data.subjects.length} unique labels. Names from your workbook remain exactly as entered until you edit them.</p>
            <label>SELECT SUBJECT<select value={subject?.id??""} onChange={e=>setSubjectId(Number(e.target.value))}>
              {data.subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select></label>
            {subject && <form key={subject.id} onSubmit={e=>submit(e,async f=>{
              await updateCrownsRow("crowns_subjects","id",subject.id,{
                name:field(f,"name"),subject_kind:field(f,"subject_kind"),
                sport:optional(f,"sport"),notes:optional(f,"notes"),
              });
            },"Subject saved.")}>
              <label>NAME<input name="name" required defaultValue={subject.name}/></label>
              <label>SUBJECT TYPE<select name="subject_kind" defaultValue={subject.subject_kind}>
                {kinds.map(k=><option key={k} value={k}>{humanize(k)}</option>)}
              </select></label>
              <label>SPORT / CATEGORY<input name="sport" defaultValue={subject.sport??""} placeholder="Optional"/></label>
              <label>NOTES<textarea name="notes" rows={3} defaultValue={subject.notes??""}/></label>
              <button className="crowns-action" type="submit" disabled={busy}>SAVE SUBJECT</button>
              <small className="crowns-source-note">{data.cards.filter(c=>c.subject_id===subject.id).length} linked card slot(s)</small>
            </form>}
          </section>
          <section className="crowns-panel">
            <h2>Add a subject</h2>
            <form onSubmit={e=>submit(e,async f=>{
              await createCrownsRow("crowns_subjects",{
                name:field(f,"name"), subject_kind:field(f,"subject_kind"),
                sport:optional(f,"sport"), notes:optional(f,"notes"),
              });
            },"Subject added to your library.")}>
              <label>SUBJECT NAME<input name="name" required placeholder="Athlete, person, event, character…"/></label>
              <label>TYPE<select name="subject_kind">{kinds.map(k=><option key={k} value={k}>{humanize(k)}</option>)}</select></label>
              <label>SPORT / CATEGORY<input name="sport" placeholder="Optional"/></label>
              <label>NOTES<textarea name="notes" rows={3}/></label>
              <button className="crowns-action crowns-action--outline" type="submit" disabled={busy}>+ ADD SUBJECT</button>
            </form>
          </section>
        </div>
      )}

      {tab === "designs" && (
        <div className="crowns-studio-grid">
          <section className="crowns-panel">
            <h2>Series catalog</h2><p>Manage the twelve original designs or create a new insert without changing code.</p>
            <label>EDIT SERIES<select value={series?.slug??""} onChange={e=>setSeriesSlug(e.target.value)}>
              {data.series.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select></label>
            {series && <form key={series.slug} onSubmit={e=>submit(e,async f=>{
              await updateCrownsRow("crowns_series","slug",series.slug,{
                name:field(f,"name"),description:field(f,"description"),
                orientation:field(f,"orientation"),rarity:field(f,"rarity"),
                active:f.has("active"),
              });
            },"Series updated.")}>
              <label>NAME<input name="name" required defaultValue={series.name}/></label>
              <label>DESCRIPTION<textarea name="description" rows={3} defaultValue={series.description}/></label>
              <div className="crowns-form-pair">
                <label>ORIENTATION<select name="orientation" defaultValue={series.orientation}><option>portrait</option><option>landscape</option></select></label>
                <label>RARITY<select name="rarity" defaultValue={series.rarity}>{["standard","signature","premium","ultra-rare"].map(s=><option key={s}>{s}</option>)}</select></label>
              </div>
              <label className="crowns-check"><input name="active" type="checkbox" defaultChecked={series.active}/> Active in the collection</label>
              <button className="crowns-action" disabled={busy}>SAVE SERIES</button>
            </form>}
            <h2>Canva templates</h2>
            <form onSubmit={e=>submit(e,async f=>{
              await createCrownsRow("crowns_templates",{
                name:field(f,"name"),series_slug:optional(f,"series_slug"),
                canva_reference:optional(f,"canva_reference"),
              });
            },"Template created.")}>
              <label>TEMPLATE NAME<input name="name" required placeholder="Classic 2026 • White border"/></label>
              <label>SERIES<select name="series_slug"><option value="">No series</option>{data.series.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
              <label>CANVA LINK / FILE REFERENCE<input name="canva_reference" placeholder="Optional design link"/></label>
              <button className="crowns-action crowns-action--outline" disabled={busy}>+ ADD TEMPLATE</button>
            </form>
            {data.templates.map(t=><div className="crowns-edition-row" key={t.id}><strong>{t.name}</strong><span>{t.series_slug||"Unassigned"}</span></div>)}
          </section>
          <section className="crowns-panel">
            <h2>Create an insert or collection</h2>
            <p>New series appear in the public-style collection guide and can be assigned to any eligible subject.</p>
            <form onSubmit={e=>submit(e,async f=>{
              const name=field(f,"name");
              const slug=field(f,"slug").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
              if(!slug)throw new Error("Enter a valid series ID.");
              await createCrownsRow("crowns_series",{
                slug,name,family:field(f,"family"),series_kind:field(f,"series_kind"),
                rarity:field(f,"rarity"),orientation:field(f,"orientation"),
                description:field(f,"description"),sort_order:data.series.length*10+50,
              });
            },"Series added.")}>
              <label>SERIES NAME<input name="name" required placeholder="New insert name"/></label>
              <label>SERIES ID<input name="slug" required placeholder="new-insert"/></label>
              <label>FAMILY<select name="family">{["classic","eclipse","nova","independent"].map(s=><option key={s} value={s}>{humanize(s)}</option>)}</select></label>
              <label>TYPE<select name="series_kind"><option value="insert">Insert</option><option value="base">Base</option><option value="collection">Independent collection</option></select></label>
              <div className="crowns-form-pair">
                <label>RARITY<select name="rarity">{["standard","signature","premium","ultra-rare"].map(s=><option key={s}>{s}</option>)}</select></label>
                <label>ORIENTATION<select name="orientation"><option>portrait</option><option>landscape</option></select></label>
              </div>
              <label>DESCRIPTION<textarea name="description" rows={3} placeholder="What makes this series distinctive?"/></label>
              <button className="crowns-action" disabled={busy}>+ CREATE SERIES</button>
            </form>
          </section>
        </div>
      )}

      {tab === "variants" && (
        <div className="crowns-studio-grid">
          <section className="crowns-panel">
            <h2>Parallel and edition manager</h2>
            <label>CARD<select value={card?.id??""} onChange={e=>setCardId(Number(e.target.value))}>{options}</select></label>
            <p>Variants belong to this specific card, not the subject or entire insert series.</p>
            <form onSubmit={e=>submit(e,async f=>{
              if(!card)throw new Error("Choose a card.");
              const one=f.has("signature_one_of_one");
              await createCrownsRow("crowns_variants",{
                card_id:card.id,name:field(f,"name"),variant_kind:field(f,"variant_kind"),
                border_treatment:optional(f,"border_treatment"),
                pattern_treatment:optional(f,"pattern_treatment"),
                serial_limit:one?1:numberOrNull(f,"serial_limit"),
                team_color_match:f.has("team_color_match"),
                jersey_number_match:f.has("jersey_number_match"),
                signature_one_of_one:one,legacy:f.has("legacy"),status:"planned",
              });
            },"Parallel / variant created.")}>
              <label>VARIANT NAME<input name="name" required placeholder="Gold Border /5"/></label>
              <label>TYPE<select name="variant_kind"><option value="parallel">Parallel</option><option value="special">Special treatment</option></select></label>
              <div className="crowns-form-pair">
                <label>BORDER<input name="border_treatment" placeholder="Gold / White / Silver"/></label>
                <label>PATTERN<input name="pattern_treatment" placeholder="Wave / Foil / Texture"/></label>
              </div>
              <label>NUMBERED PRINT LIMIT<input name="serial_limit" min="1" type="number" placeholder="5"/></label>
              <label className="crowns-check"><input name="team_color_match" type="checkbox"/> Team-color match</label>
              <label className="crowns-check"><input name="jersey_number_match" type="checkbox"/> Jersey-number match</label>
              <label className="crowns-check"><input name="signature_one_of_one" type="checkbox"/> Signature 1/1 (forces /1)</label>
              <label className="crowns-check"><input name="legacy" type="checkbox"/> LEGACY designation</label>
              <button className="crowns-action" disabled={busy}>+ CREATE VARIANT</button>
            </form>
          </section>
          <section className="crowns-panel">
            <h2>Existing editions</h2>
            {cardVariants.length===0&&<p>No parallel editions yet.</p>}
            {cardVariants.length>0 && <label>EDIT VARIANT<select value={variant?.id??""} onChange={e=>setVariantId(Number(e.target.value))}>
              {cardVariants.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </select></label>}
            {variant&&<form key={variant.id} onSubmit={e=>submit(e,async f=>{
              const one=f.has("signature_one_of_one");
              await updateCrownsRow("crowns_variants","id",variant.id,{
                name:field(f,"name"),border_treatment:optional(f,"border_treatment"),
                pattern_treatment:optional(f,"pattern_treatment"),
                serial_limit:one?1:numberOrNull(f,"serial_limit"),
                team_color_match:f.has("team_color_match"),jersey_number_match:f.has("jersey_number_match"),
                signature_one_of_one:one,legacy:f.has("legacy"),status:field(f,"status"),notes:optional(f,"notes"),
              });
            },"Variant saved.")}>
              <label>NAME<input name="name" defaultValue={variant.name} required/></label>
              <div className="crowns-form-pair">
                <label>BORDER<input name="border_treatment" defaultValue={variant.border_treatment??""}/></label>
                <label>PATTERN<input name="pattern_treatment" defaultValue={variant.pattern_treatment??""}/></label>
              </div>
              <label>EDITION LIMIT<input type="number" min="1" name="serial_limit" defaultValue={variant.serial_limit??""}/></label>
              <label>STATUS<select name="status" defaultValue={variant.status}>{statuses.map(s=><option key={s} value={s}>{humanize(s)}</option>)}</select></label>
              <label className="crowns-check"><input name="team_color_match" type="checkbox" defaultChecked={variant.team_color_match}/> Team-color match</label>
              <label className="crowns-check"><input name="jersey_number_match" type="checkbox" defaultChecked={variant.jersey_number_match}/> Jersey-number match</label>
              <label className="crowns-check"><input name="signature_one_of_one" type="checkbox" defaultChecked={variant.signature_one_of_one}/> Signature 1/1</label>
              <label className="crowns-check"><input name="legacy" type="checkbox" defaultChecked={variant.legacy}/> LEGACY</label>
              <label>NOTES<textarea name="notes" defaultValue={variant.notes??""} rows={2}/></label>
              <button className="crowns-action" disabled={busy}>SAVE VARIANT</button>
            </form>}
            {variant&&<div className="crowns-upload-grid">
              {faceUpload("variants",variant.id,"front",variant.front_path)}
              {faceUpload("variants",variant.id,"back",variant.back_path)}
            </div>}
          </section>
        </div>
      )}

      {tab === "production" && (
        <div className="crowns-studio-grid">
          <section className="crowns-panel">
            <h2>Physical production</h2><p>Digital designs and printed copies are tracked separately.</p>
            <label>SELECT CARD<select value={card?.id??""} onChange={e=>setCardId(Number(e.target.value))}>{options}</select></label>
            <form onSubmit={e=>submit(e,async f=>{
              if(!card)throw new Error("Choose a card.");
              const variant_id=numberOrNull(f,"variant_id");
              const serial_number=numberOrNull(f,"serial_number");
              const variantRecord=data.variants.find(v=>v.id===variant_id);
              if(variantRecord?.serial_limit && serial_number && serial_number>variantRecord.serial_limit)
                throw new Error("Serial exceeds the numbered edition limit.");
              if(variantRecord?.serial_limit && !serial_number)
                throw new Error("This numbered edition needs a serial number.");
              await createCrownsRow("crowns_copies",{
                card_id:card.id,variant_id,serial_number,status:field(f,"status"),notes:optional(f,"notes"),
              });
            },"Physical copy recorded.")}>
              <label>EDITION<select name="variant_id"><option value="">Standard card</option>
                {cardVariants.map(v=><option key={v.id} value={v.id}>{v.name}{v.serial_limit?` /${v.serial_limit}`:""}</option>)}
              </select></label>
              <div className="crowns-form-pair">
                <label>SERIAL NUMBER<input type="number" min="1" name="serial_number" placeholder="Optional for standard"/></label>
                <label>PRODUCTION STATUS<select name="status">{["planned","ordered","printed","in-hand"].map(s=><option key={s} value={s}>{humanize(s)}</option>)}</select></label>
              </div>
              <label>NOTES<input name="notes" placeholder="Printer, finish, or storage details"/></label>
              <button className="crowns-action" disabled={busy}>+ RECORD COPY</button>
            </form>
          </section>
          <section className="crowns-panel">
            <h2>Copy inventory</h2>
            <p>{cardCopies.length} individual physical record(s) for this card.</p>
            {cardCopies.map(copy=><div className="crowns-edition-row" key={copy.id}>
              <div><strong>{copy.variant_id ? data.variants.find(v=>v.id===copy.variant_id)?.name||"Variant" : "Standard"}{copy.serial_number?` · #${copy.serial_number}`:""}</strong>
                <small>{copy.notes}</small></div>
              <select aria-label="Physical copy production status" value={copy.status} disabled={busy}
                onChange={e=>{const value=e.target.value;void ownerTask(()=>updateCrownsRow("crowns_copies","id",copy.id,{status:value}),"Copy status updated.");}}>
                {["planned","ordered","printed","in-hand"].map(s=><option key={s} value={s}>{humanize(s)}</option>)}
              </select>
            </div>)}
          </section>
        </div>
      )}
    </section>
  );
}
