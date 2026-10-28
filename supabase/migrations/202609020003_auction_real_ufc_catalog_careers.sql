-- Auction PR 5 reviewed UFC-only catalog rows.
select private.seed_auction_catalog_rows(
$auction_catalog_rows$
jon-jones-performances|Jon Jones vs Mauricio Rua — UFC 128|5|0.18|signature|100
jon-jones-performances|Jon Jones vs Lyoto Machida — UFC 140|4|0.18|signature|99
jon-jones-performances|Jon Jones vs Daniel Cormier — UFC 182|4|0.18|signature|98
jon-jones-performances|Jon Jones vs Alexander Gustafsson — UFC 165|3|1.0|core|97
jon-jones-performances|Jon Jones vs Ciryl Gane — UFC 285|3|1.0|core|96
jon-jones-performances|Jon Jones vs Quinton Jackson — UFC 135|3|1.0|core|95
jon-jones-performances|Jon Jones vs Rashad Evans — UFC 145|3|1.0|core|95
jon-jones-performances|Jon Jones vs Glover Teixeira — UFC 172|3|1.0|core|94
jon-jones-performances|Jon Jones vs Alexander Gustafsson — UFC 232|3|1.0|core|93
jon-jones-performances|Jon Jones vs Stipe Miocic — UFC 309|3|1.0|core|91
jon-jones-performances|Jon Jones vs Vitor Belfort — UFC 152|3|1.0|core|90
jon-jones-performances|Jon Jones vs Chael Sonnen — UFC 159|3|1.0|core|88
conor-mcgregor-performances|Conor McGregor vs Eddie Alvarez — UFC 205|5|0.1|signature|100
conor-mcgregor-performances|Conor McGregor vs Jose Aldo — UFC 194|4|0.1|signature|100
conor-mcgregor-performances|Conor McGregor vs Chad Mendes — UFC 189|4|0.1|signature|97
conor-mcgregor-performances|Conor McGregor vs Dustin Poirier — UFC 178|3|1.0|core|96
conor-mcgregor-performances|Conor McGregor vs Nate Diaz — UFC 202|3|1.0|core|95
conor-mcgregor-performances|Conor McGregor vs Donald Cerrone — UFC 246|3|1.0|core|92
conor-mcgregor-performances|Conor McGregor vs Max Holloway — UFC Fight Night 26|3|1.0|core|90
conor-mcgregor-performances|Conor McGregor vs Diego Brandao — UFC Fight Night 46|3|1.0|core|89
conor-mcgregor-performances|Conor McGregor vs Dennis Siver — UFC Fight Night 59|3|1.0|core|88
conor-mcgregor-performances|Conor McGregor vs Marcus Brimage — UFC on Fuel TV 9|3|1.0|core|86
charles-oliveira-performances|Charles Oliveira vs Michael Chandler — UFC 262|5|0.18|signature|100
charles-oliveira-performances|Charles Oliveira vs Dustin Poirier — UFC 269|4|0.18|signature|99
charles-oliveira-performances|Charles Oliveira vs Justin Gaethje — UFC 274|4|0.18|signature|98
charles-oliveira-performances|Charles Oliveira vs Tony Ferguson — UFC 256|3|1.0|core|96
charles-oliveira-performances|Charles Oliveira vs Kevin Lee — UFC Fight Night 170|3|1.0|core|95
charles-oliveira-performances|Charles Oliveira vs Beneil Dariush — UFC 289|3|1.0|core|95
charles-oliveira-performances|Charles Oliveira vs Michael Chandler — UFC 309|3|1.0|core|94
charles-oliveira-performances|Charles Oliveira vs Jim Miller — UFC on Fox 31|3|1.0|core|92
charles-oliveira-performances|Charles Oliveira vs Nik Lentz — UFC Fight Night 152|3|1.0|core|90
charles-oliveira-performances|Charles Oliveira vs Clay Guida — UFC 225|3|1.0|core|89
charles-oliveira-performances|Charles Oliveira vs Jared Gordon — UFC Fight Night 164|3|1.0|core|88
charles-oliveira-performances|Charles Oliveira vs Will Brooks — UFC 210|3|1.0|core|87
$auction_catalog_rows$
);
