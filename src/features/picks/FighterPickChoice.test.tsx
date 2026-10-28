import { cleanup,fireEvent,render,screen } from "@testing-library/react";
import { afterEach,describe,expect,it,vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { FighterPickChoice } from "./FighterPickChoice";
afterEach(cleanup);

function choice(slug:string,name:string,onPick=vi.fn(),selected=false) {
  render(<MemoryRouter><FighterPickChoice eventId="ufc-test" corner="blue"
    name={name} slug={slug} odds="+200" selected={selected}
    favorite={false} disabled={false} statusLabel={null} onPick={onPick}/></MemoryRouter>);
  return onPick;
}
describe("UFC separate fighter badges and pick targets",()=>{
  it("opens SKCS scouting directly without making a pick",()=>{
    const onPick=choice("quillan-salkilld","Quillan Salkilld");
    const link=screen.getByRole("link",{name:/Open Quillan Salkilld SKCS scouting profile/});
    expect(link).toHaveAttribute("href","/fighters-to-watch#quillan-salkilld");
    expect(link).toHaveTextContent("SKCS #1");
    fireEvent.click(link);
    expect(onPick).not.toHaveBeenCalled();
  });
  it("uses a separate select control with selected glow and a checkmark, not a Your Pick pill",()=>{
    const onPick=choice("quillan-salkilld","Quillan Salkilld",vi.fn(),true);
    expect(screen.getByRole("button",{name:"Pick Quillan Salkilld"})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByLabelText("Your pick")).toHaveTextContent("✓");
    expect(screen.queryByText("YOUR PICK")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Pick Quillan Salkilld"}));
    expect(onPick).toHaveBeenCalledTimes(1);
  });
  it("opens actual HQ ranked profile with no selection side effect",()=>{
    const onPick=choice("jon-jones","Jon Jones");
    const link=screen.getByRole("link",{name:/Open Jon Jones HQ ranking profile/});
    expect(link).toHaveAttribute("href","/fighters/jon-jones");
    fireEvent.click(link);
    expect(onPick).not.toHaveBeenCalled();
  });
});
