-- Stage 13 locked NFL + CFB Trio player pools. Hidden grades are server-only calibration inputs.
with raw as (
  select line, ordinality
  from regexp_split_to_table($trio_pool$trio-nfl|QB|Elite|Tom Brady|98||
trio-nfl|QB|Elite|Peyton Manning|98||
trio-nfl|QB|Elite|Aaron Rodgers|97||
trio-nfl|QB|Elite|Patrick Mahomes|98||
trio-nfl|QB|Elite|Joe Montana|97||
trio-nfl|QB|Elite|Dan Marino|96||
trio-nfl|QB|Elite|Steve Young|96||
trio-nfl|QB|Elite|Brett Favre|94||
trio-nfl|QB|Great|Drew Brees|93||
trio-nfl|QB|Great|Josh Allen|92||
trio-nfl|QB|Great|Lamar Jackson|92||
trio-nfl|QB|Great|Joe Burrow|91||
trio-nfl|QB|Great|Ben Roethlisberger|90||
trio-nfl|QB|Great|Russell Wilson|90||
trio-nfl|QB|Great|Matthew Stafford|90||
trio-nfl|QB|Great|Cam Newton|90||
trio-nfl|QB|Great|John Elway|93||
trio-nfl|QB|Great|Kurt Warner|91||
trio-nfl|QB|Great|Warren Moon|90||
trio-nfl|QB|Great|Roger Staubach|93||
trio-nfl|QB|Good|Matt Ryan|88||
trio-nfl|QB|Good|Tony Romo|87||
trio-nfl|QB|Good|Philip Rivers|88||
trio-nfl|QB|Good|Andrew Luck|88||
trio-nfl|QB|Good|Dak Prescott|86||
trio-nfl|QB|Good|Justin Herbert|86||
trio-nfl|QB|Good|Jalen Hurts|85||
trio-nfl|QB|Good|Jared Goff|85||
trio-nfl|QB|Good|Kirk Cousins|85||
trio-nfl|QB|Good|Carson Palmer|87||
trio-nfl|QB|Good|Michael Vick|87||
trio-nfl|QB|Good|Eli Manning|86||
trio-nfl|QB|Good|Baker Mayfield|84||
trio-nfl|QB|Good|Troy Aikman|88||
trio-nfl|QB|Good|Randall Cunningham|88||
trio-nfl|QB|Good|Donovan McNabb|87||
trio-nfl|QB|Average|Joe Flacco|83||
trio-nfl|QB|Average|Derek Carr|82||
trio-nfl|QB|Average|Alex Smith|82||
trio-nfl|QB|Average|Jay Cutler|82||
trio-nfl|QB|Average|Andy Dalton|81||
trio-nfl|QB|Average|Ryan Tannehill|80||
trio-nfl|QB|Average|Kyler Murray|83||
trio-nfl|QB|Average|Tua Tagovailoa|82||
trio-nfl|QB|Average|Brock Purdy|83||
trio-nfl|QB|Average|Geno Smith|80||
trio-nfl|QB|Average|Jimmy Garoppolo|79||
trio-nfl|QB|Average|Jameis Winston|80||
trio-nfl|QB|Average|Trevor Lawrence|81||
trio-nfl|QB|Average|Drew Bledsoe|83||
trio-nfl|RB|Elite|Adrian Peterson|98||
trio-nfl|RB|Elite|LaDainian Tomlinson|98||
trio-nfl|RB|Elite|Derrick Henry|97||
trio-nfl|RB|Elite|Christian McCaffrey|97||
trio-nfl|RB|Elite|Barry Sanders|98||
trio-nfl|RB|Elite|Walter Payton|98||
trio-nfl|RB|Elite|Emmitt Smith|97||
trio-nfl|RB|Elite|Marshall Faulk|97||
trio-nfl|RB|Great|Saquon Barkley|93||
trio-nfl|RB|Great|Jamaal Charles|91||
trio-nfl|RB|Great|Marshawn Lynch|91||
trio-nfl|RB|Great|LeSean McCoy|92||
trio-nfl|RB|Great|Todd Gurley|92||
trio-nfl|RB|Great|Arian Foster|91||
trio-nfl|RB|Great|Nick Chubb|91||
trio-nfl|RB|Great|Jonathan Taylor|91||
trio-nfl|RB|Great|Eric Dickerson|93||
trio-nfl|RB|Great|Earl Campbell|93||
trio-nfl|RB|Great|Terrell Davis|92||
trio-nfl|RB|Great|Bo Jackson|89||
trio-nfl|RB|Good|Alvin Kamara|88||
trio-nfl|RB|Good|Ezekiel Elliott|88||
trio-nfl|RB|Good|Matt Forte|86||
trio-nfl|RB|Good|Maurice Jones-Drew|87||
trio-nfl|RB|Good|Steven Jackson|86||
trio-nfl|RB|Good|Frank Gore|87||
trio-nfl|RB|Good|Chris Johnson|88||
trio-nfl|RB|Good|Clinton Portis|87||
trio-nfl|RB|Good|Josh Jacobs|86||
trio-nfl|RB|Good|Aaron Jones|85||
trio-nfl|RB|Good|Bijan Robinson|87||
trio-nfl|RB|Good|Jahmyr Gibbs|87||
trio-nfl|RB|Good|DeMarco Murray|87||
trio-nfl|RB|Good|Jerome Bettis|87||
trio-nfl|RB|Good|Curtis Martin|88||
trio-nfl|RB|Good|Priest Holmes|88||
trio-nfl|RB|Average|Mark Ingram|83||
trio-nfl|RB|Average|Reggie Bush|81||
trio-nfl|RB|Average|Melvin Gordon|82||
trio-nfl|RB|Average|Darren McFadden|80||
trio-nfl|RB|Average|Devonta Freeman|81||
trio-nfl|RB|Average|James Conner|82||
trio-nfl|RB|Average|David Montgomery|83||
trio-nfl|RB|Average|Najee Harris|80||
trio-nfl|RB|Average|Breece Hall|83||
trio-nfl|RB|Average|DeAngelo Williams|83||
trio-nfl|RB|Average|Thomas Jones|82||
trio-nfl|RB|Average|Ronnie Brown|80||
trio-nfl|RB|Average|Rhamondre Stevenson|79||
trio-nfl|RB|Average|Ricky Williams|83||
trio-nfl|WR|Elite|Calvin Johnson|98||
trio-nfl|WR|Elite|Larry Fitzgerald|97||
trio-nfl|WR|Elite|Julio Jones|97||
trio-nfl|WR|Elite|Antonio Brown|97||
trio-nfl|WR|Elite|Jerry Rice|98||
trio-nfl|WR|Elite|Randy Moss|98||
trio-nfl|WR|Elite|Terrell Owens|97||
trio-nfl|WR|Elite|Marvin Harrison|97||
trio-nfl|WR|Great|Tyreek Hill|93||
trio-nfl|WR|Great|Davante Adams|93||
trio-nfl|WR|Great|DeAndre Hopkins|92||
trio-nfl|WR|Great|Mike Evans|92||
trio-nfl|WR|Great|A.J. Green|92||
trio-nfl|WR|Great|Justin Jefferson|93||
trio-nfl|WR|Great|Ja’Marr Chase|92||
trio-nfl|WR|Great|CeeDee Lamb|92||
trio-nfl|WR|Great|Cris Carter|93||
trio-nfl|WR|Great|Michael Irvin|92||
trio-nfl|WR|Great|Isaac Bruce|91||
trio-nfl|WR|Great|Torry Holt|91||
trio-nfl|WR|Good|Andre Johnson|88||
trio-nfl|WR|Good|Steve Smith Sr.|88||
trio-nfl|WR|Good|Reggie Wayne|88||
trio-nfl|WR|Good|Brandon Marshall|87||
trio-nfl|WR|Good|Dez Bryant|87||
trio-nfl|WR|Good|Demaryius Thomas|88||
trio-nfl|WR|Good|Cooper Kupp|88||
trio-nfl|WR|Good|Stefon Diggs|87||
trio-nfl|WR|Good|Keenan Allen|86||
trio-nfl|WR|Good|Amari Cooper|85||
trio-nfl|WR|Good|A.J. Brown|88||
trio-nfl|WR|Good|Deebo Samuel|86||
trio-nfl|WR|Good|Odell Beckham Jr.|87||
trio-nfl|WR|Good|Sterling Sharpe|88||
trio-nfl|WR|Good|Chad Johnson|88||
trio-nfl|WR|Good|Hines Ward|86||
trio-nfl|WR|Average|T.Y. Hilton|83||
trio-nfl|WR|Average|Brandin Cooks|82||
trio-nfl|WR|Average|Jarvis Landry|81||
trio-nfl|WR|Average|Adam Thielen|82||
trio-nfl|WR|Average|Tyler Lockett|82||
trio-nfl|WR|Average|Chris Godwin|83||
trio-nfl|WR|Average|Terry McLaurin|82||
trio-nfl|WR|Average|D.J. Moore|82||
trio-nfl|WR|Average|DK Metcalf|83||
trio-nfl|WR|Average|Mike Williams|80||
trio-nfl|WR|Average|Courtland Sutton|80||
trio-nfl|WR|Average|DeVonta Smith|83||
trio-nfl|WR|Average|Plaxico Burress|83||
trio-nfl|WR|Average|Keyshawn Johnson|82||
trio-cfb|QB|Elite|Joe Burrow|98|LSU|2019
trio-cfb|QB|Elite|Cam Newton|98|Auburn|2010
trio-cfb|QB|Elite|Vince Young|97|Texas|2005
trio-cfb|QB|Elite|Tim Tebow|97|Florida|2007
trio-cfb|QB|Elite|Lamar Jackson|97|Louisville|2016
trio-cfb|QB|Elite|Johnny Manziel|96|Texas A&M|2012
trio-cfb|QB|Elite|Robert Griffin III|96|Baylor|2011
trio-cfb|QB|Elite|Marcus Mariota|96|Oregon|2014
trio-cfb|QB|Great|Caleb Williams|93|USC|2022
trio-cfb|QB|Great|Baker Mayfield|93|Oklahoma|2017
trio-cfb|QB|Great|Kyler Murray|93|Oklahoma|2018
trio-cfb|QB|Great|Jayden Daniels|93|LSU|2023
trio-cfb|QB|Great|Bryce Young|92|Alabama|2021
trio-cfb|QB|Great|Trevor Lawrence|92|Clemson|2018
trio-cfb|QB|Great|Deshaun Watson|92|Clemson|2016
trio-cfb|QB|Great|Jameis Winston|93|Florida State|2013
trio-cfb|QB|Great|Sam Bradford|92|Oklahoma|2008
trio-cfb|QB|Great|Andrew Luck|92|Stanford|2011
trio-cfb|QB|Great|Tua Tagovailoa|91|Alabama|2018
trio-cfb|QB|Great|Fernando Mendoza|93|Indiana|2025
trio-cfb|QB|Good|C.J. Stroud|88|Ohio State|2021
trio-cfb|QB|Good|Jalen Hurts|88|Oklahoma|2019
trio-cfb|QB|Good|Justin Fields|88|Ohio State|2019
trio-cfb|QB|Good|Bo Nix|87|Oregon|2023
trio-cfb|QB|Good|Michael Penix Jr.|88|Washington|2023
trio-cfb|QB|Good|Mac Jones|88|Alabama|2020
trio-cfb|QB|Good|Colt McCoy|88|Texas|2008
trio-cfb|QB|Good|Dak Prescott|86|Mississippi State|2014
trio-cfb|QB|Good|Stetson Bennett|87|Georgia|2022
trio-cfb|QB|Good|Cam Ward|87|Miami|2024
trio-cfb|QB|Good|Shedeur Sanders|85|Colorado|2024
trio-cfb|QB|Good|Quinn Ewers|85|Texas|2023
trio-cfb|QB|Good|Hendon Hooker|87|Tennessee|2022
trio-cfb|QB|Good|Teddy Bridgewater|86|Louisville|2012
trio-cfb|QB|Good|Dwayne Haskins|87|Ohio State|2018
trio-cfb|QB|Good|Kenny Pickett|87|Pittsburgh|2021
trio-cfb|QB|Average|Sam Ehlinger|83|Texas|2018
trio-cfb|QB|Average|J.J. McCarthy|83|Michigan|2023
trio-cfb|QB|Average|Jake Fromm|82|Georgia|2018
trio-cfb|QB|Average|Kellen Moore|83|Boise State|2010
trio-cfb|QB|Average|Case Keenum|83|Houston|2011
trio-cfb|QB|Average|Denard Robinson|83|Michigan|2010
trio-cfb|QB|Average|Marcus Vick|79|Virginia Tech|2005
trio-cfb|QB|Average|Jimmy Clausen|81|Notre Dame|2009
trio-cfb|QB|Average|Jordan Travis|83|Florida State|2023
trio-cfb|QB|Average|Spencer Rattler|80|Oklahoma|2020
trio-cfb|QB|Average|Dillon Gabriel|83|Oregon|2024
trio-cfb|QB|Average|Brock Purdy|81|Iowa State|2020
trio-cfb|QB|Average|Will Grier|82|West Virginia|2018
trio-cfb|QB|Average|Mason Rudolph|82|Oklahoma State|2017
trio-cfb|RB|Elite|Reggie Bush|98|USC|2005
trio-cfb|RB|Elite|Derrick Henry|98|Alabama|2015
trio-cfb|RB|Elite|Christian McCaffrey|97|Stanford|2015
trio-cfb|RB|Elite|Saquon Barkley|96|Penn State|2017
trio-cfb|RB|Elite|Jonathan Taylor|97|Wisconsin|2019
trio-cfb|RB|Elite|Ashton Jeanty|98|Boise State|2024
trio-cfb|RB|Elite|Darren McFadden|97|Arkansas|2007
trio-cfb|RB|Elite|Ezekiel Elliott|96|Ohio State|2014
trio-cfb|RB|Great|Bijan Robinson|93|Texas|2022
trio-cfb|RB|Great|Todd Gurley|92|Georgia|2013
trio-cfb|RB|Great|Melvin Gordon|93|Wisconsin|2014
trio-cfb|RB|Great|Nick Chubb|92|Georgia|2014
trio-cfb|RB|Great|Dalvin Cook|93|Florida State|2015
trio-cfb|RB|Great|Trent Richardson|92|Alabama|2011
trio-cfb|RB|Great|Mark Ingram|92|Alabama|2009
trio-cfb|RB|Great|LaMichael James|92|Oregon|2010
trio-cfb|RB|Great|Leonard Fournette|92|LSU|2015
trio-cfb|RB|Great|Kenneth Walker III|93|Michigan State|2021
trio-cfb|RB|Great|J.K. Dobbins|91|Ohio State|2019
trio-cfb|RB|Great|Jeremiyah Love|93|Notre Dame|2025
trio-cfb|RB|Good|Jamaal Charles|87|Texas|2007
trio-cfb|RB|Good|DeMarco Murray|87|Oklahoma|2010
trio-cfb|RB|Good|Travis Etienne|88|Clemson|2018
trio-cfb|RB|Good|Najee Harris|88|Alabama|2020
trio-cfb|RB|Good|Breece Hall|88|Iowa State|2020
trio-cfb|RB|Good|Jahmyr Gibbs|85|Alabama|2022
trio-cfb|RB|Good|Ollie Gordon II|88|Oklahoma State|2023
trio-cfb|RB|Good|Bryce Love|88|Stanford|2017
trio-cfb|RB|Good|Chuba Hubbard|87|Oklahoma State|2019
trio-cfb|RB|Good|D’Onta Foreman|86|Texas|2016
trio-cfb|RB|Good|Josh Jacobs|86|Alabama|2018
trio-cfb|RB|Good|TreVeyon Henderson|87|Ohio State|2024
trio-cfb|RB|Good|DeAngelo Williams|88|Memphis|2005
trio-cfb|RB|Good|Le’Veon Bell|87|Michigan State|2012
trio-cfb|RB|Good|Montee Ball|88|Wisconsin|2011
trio-cfb|RB|Good|Alvin Kamara|84|Tennessee|2016
trio-cfb|RB|Average|Quinshon Judkins|83|Ole Miss|2022
trio-cfb|RB|Average|Omarion Hampton|83|North Carolina|2024
trio-cfb|RB|Average|Clyde Edwards-Helaire|83|LSU|2019
trio-cfb|RB|Average|D’Andre Swift|82|Georgia|2018
trio-cfb|RB|Average|Sony Michel|82|Georgia|2017
trio-cfb|RB|Average|James Cook|82|Georgia|2021
trio-cfb|RB|Average|Aaron Jones|82|UTEP|2016
trio-cfb|RB|Average|David Montgomery|83|Iowa State|2018
trio-cfb|RB|Average|Carlos Hyde|82|Ohio State|2013
trio-cfb|RB|Average|Blake Corum|83|Michigan|2023
trio-cfb|RB|Average|Damien Harris|81|Alabama|2017
trio-cfb|RB|Average|Samaje Perine|83|Oklahoma|2014
trio-cfb|RB|Average|Miles Sanders|81|Penn State|2018
trio-cfb|RB|Average|Kyren Williams|82|Notre Dame|2020
trio-cfb|WR|Elite|Calvin Johnson|98|Georgia Tech|2006
trio-cfb|WR|Elite|Michael Crabtree|98|Texas Tech|2007
trio-cfb|WR|Elite|Justin Blackmon|98|Oklahoma State|2010
trio-cfb|WR|Elite|Amari Cooper|97|Alabama|2014
trio-cfb|WR|Elite|Ja’Marr Chase|97|LSU|2019
trio-cfb|WR|Elite|DeVonta Smith|98|Alabama|2020
trio-cfb|WR|Elite|Marvin Harrison Jr.|96|Ohio State|2023
trio-cfb|WR|Elite|Travis Hunter|97|Colorado|2024
trio-cfb|WR|Great|CeeDee Lamb|92|Oklahoma|2019
trio-cfb|WR|Great|Justin Jefferson|92|LSU|2019
trio-cfb|WR|Great|Julio Jones|92|Alabama|2010
trio-cfb|WR|Great|A.J. Green|92|Georgia|2008
trio-cfb|WR|Great|Sammy Watkins|93|Clemson|2011
trio-cfb|WR|Great|Mike Evans|92|Texas A&M|2013
trio-cfb|WR|Great|Jerry Jeudy|91|Alabama|2018
trio-cfb|WR|Great|Jordan Addison|93|Pittsburgh|2021
trio-cfb|WR|Great|Marqise Lee|93|USC|2012
trio-cfb|WR|Great|Malik Nabers|93|LSU|2023
trio-cfb|WR|Great|Rome Odunze|92|Washington|2023
trio-cfb|WR|Great|Jeremiah Smith|93|Ohio State|2024
trio-cfb|WR|Good|Odell Beckham Jr.|87|LSU|2013
trio-cfb|WR|Good|DeAndre Hopkins|88|Clemson|2012
trio-cfb|WR|Good|Tee Higgins|86|Clemson|2019
trio-cfb|WR|Good|Jaylen Waddle|87|Alabama|2019
trio-cfb|WR|Good|Garrett Wilson|87|Ohio State|2021
trio-cfb|WR|Good|Chris Olave|87|Ohio State|2021
trio-cfb|WR|Good|Jaxon Smith-Njigba|88|Ohio State|2021
trio-cfb|WR|Good|Jameson Williams|87|Alabama|2021
trio-cfb|WR|Good|Brandin Cooks|88|Oregon State|2013
trio-cfb|WR|Good|Golden Tate|87|Notre Dame|2009
trio-cfb|WR|Good|Dede Westbrook|88|Oklahoma|2016
trio-cfb|WR|Good|Jalin Hyatt|87|Tennessee|2022
trio-cfb|WR|Good|Tetairoa McMillan|88|Arizona|2024
trio-cfb|WR|Good|Luther Burden III|87|Missouri|2023
trio-cfb|WR|Good|Xavier Worthy|86|Texas|2023
trio-cfb|WR|Good|Makai Lemon|87|USC|2025
trio-cfb|WR|Average|George Pickens|82|Georgia|2020
trio-cfb|WR|Average|Ladd McConkey|83|Georgia|2022
trio-cfb|WR|Average|Emeka Egbuka|83|Ohio State|2024
trio-cfb|WR|Average|Calvin Ridley|82|Alabama|2015
trio-cfb|WR|Average|Christian Kirk|82|Texas A&M|2015
trio-cfb|WR|Average|Adonai Mitchell|81|Texas|2023
trio-cfb|WR|Average|Nico Collins|81|Michigan|2019
trio-cfb|WR|Average|Brian Thomas Jr.|83|LSU|2023
trio-cfb|WR|Average|Jahan Dotson|82|Penn State|2021
trio-cfb|WR|Average|Terry McLaurin|80|Ohio State|2018
trio-cfb|WR|Average|JuJu Smith-Schuster|83|USC|2015
trio-cfb|WR|Average|Michael Floyd|83|Notre Dame|2011
trio-cfb|WR|Average|James Washington|83|Oklahoma State|2017
trio-cfb|WR|Average|Corey Coleman|83|Baylor|2015$trio_pool$, E'\\n') with ordinality as source(line, ordinality)
  where trim(line) <> ''
), parsed as (
  select
    split_part(line, '|', 1) as mode_id,
    split_part(line, '|', 2) as position,
    split_part(line, '|', 3) as tier,
    split_part(line, '|', 4) as display_name,
    split_part(line, '|', 5)::numeric as hidden_grade,
    nullif(split_part(line, '|', 6), '') as peak_team,
    nullif(split_part(line, '|', 7), '')::integer as peak_season,
    ordinality
  from raw
), numbered as (
  select
    parsed.*,
    row_number() over (partition by mode_id, position, tier order by ordinality) as tier_index
  from parsed
)
insert into private.draft_room_trio_player_pool (
  mode_id,
  position,
  player_reference,
  display_name,
  tier,
  tier_rank,
  hidden_grade,
  peak_team,
  peak_season
)
select
  mode_id,
  position,
  mode_id || '-' || lower(position) || '-' || lower(tier) || '-' || lpad(tier_index::text, 2, '0'),
  display_name,
  tier,
  case tier when 'Elite' then 4 when 'Great' then 3 when 'Good' then 2 else 1 end,
  hidden_grade,
  peak_team,
  peak_season
from numbered
order by ordinality;

do $$
begin
  if (select count(*) from private.draft_room_trio_player_pool) <> 300 then
    raise exception 'Stage 13 Trio player pool must contain exactly 300 players';
  end if;

  if exists (
    select 1
    from (
      select mode_id, position, tier, count(*) as player_count
      from private.draft_room_trio_player_pool
      group by mode_id, position, tier
    ) counts
    where counts.player_count <> case counts.tier
      when 'Elite' then 8
      when 'Great' then 12
      when 'Good' then 16
      when 'Average' then 14
      else -1
    end
  ) then
    raise exception 'Stage 13 Trio tier counts drifted from 8/12/16/14';
  end if;

  if exists (
    select 1 from private.draft_room_trio_player_pool
    where mode_id = 'trio-cfb' and (peak_season < 2005 or peak_team is null)
  ) then
    raise exception 'Stage 13 CFB Trio pool contains a pre-2005 or unbound peak college identity';
  end if;
end;
$$;
