import heroCoastal from "@/assets/hero-coastal.jpg";
import techCircuit from "@/assets/tech-circuit.jpg";
import cultureInstallation from "@/assets/culture-installation.jpg";
import businessDistrict from "@/assets/business-district.jpg";
import techChips from "@/assets/tech-chips.jpg";
import techNightsky from "@/assets/tech-nightsky.jpg";
import businessOffice from "@/assets/business-office.jpg";
import worldSeas from "@/assets/world-seas.jpg";

export const CATEGORIES = ["World", "Tech", "Business", "Culture"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Article {
  slug: string;
  title: string;
  category: Category;
  excerpt: string;
  author: string;
  readTime: number;
  published: string;
  image: string;
  imageAlt: string;
  body: string[];
}

export const articles: Article[] = [
  {
    slug: "coastal-cities",
    title: "The Quiet Reckoning of the Coastal Cities",
    category: "World",
    excerpt:
      "As sea levels creep upward, a new generation of planners is redrawing the map — not by building higher, but by learning to let go.",
    author: "Mara Voss",
    readTime: 8,
    published: "2h ago",
    image: heroCoastal,
    imageAlt: "Aerial view of a coastal city at dawn, mist drifting over the water",
    body: [
      "From the observation deck of Rotterdam's newest flood barrier, the city below does not look like a place under siege. It looks like a city that has made its peace with water — canals where parking lots used to be, a plaza that becomes a lake every high tide, houses that float gently on their moorings when the rivers rise.",
      "Two decades ago, this was heresy. The orthodoxy of coastal engineering was resistance: higher walls, deeper pumps, thicker concrete. Today, a quiet revolution is underway in city halls from Miami to Jakarta. The question is no longer how to hold the line, but where — deliberately, democratically — to give it up.",
      "The economics are stark. Insurers have begun pricing retreat into premiums, and the market is doing what decades of warnings could not. In Norfolk, in Alexandria, in the outer suburbs of Sydney, buyout programs are converting the most flood-prone blocks into parkland and wetland, one willing seller at a time.",
      "Critics call it triage dressed up as vision. Planners call it the first honest conversation the coast has ever had. What everyone agrees on is that the next century of the waterfront will be written not in concrete, but in the languages of negotiation: easements, easings, and the slow transfer of land back to the tide.",
    ],
  },
  {
    slug: "post-silicon",
    title: "The Post-Silicon Bet",
    category: "Tech",
    excerpt:
      "Chipmakers are placing billion-dollar wagers on materials that make silicon look quaint — and the first working prototypes are already on the lab bench.",
    author: "Daniel Osei",
    readTime: 12,
    published: "5h ago",
    image: techCircuit,
    imageAlt: "Close-up of a circuit board glowing with soft blue light",
    body: [
      "For sixty years, the entire digital world has been an argument about how small we could carve silicon. That argument is not over — but for the first time, it is no longer the only one on the table.",
      "In a cluster of nondescript buildings outside Eindhoven, engineers are testing processors etched from materials that switch on properties silicon simply does not have: spin, light, and superconducting coherence. None of them will replace the transistor in your phone this decade. All of them could redefine what a computer is.",
      "The money is following the physics. Three of the five largest chipmakers have quietly created long-horizon research divisions with mandates measured in generations, not product cycles. Their internal forecasts, shared with Telyra, suggest commercially meaningful post-silicon hardware could arrive within twelve years.",
      "Skeptics have heard this song before, and they are right that the graveyard of computing is full of elegant physics. But the difference now is desperation: silicon's roadmaps are getting expensive faster than they are getting better. When the incumbent stalls, the heretics get funded.",
    ],
  },
  {
    slug: "long-form-revival",
    title: "The Long-Form Revival",
    category: "Culture",
    excerpt:
      "Against every trend line, readers are choosing slow, demanding writing again — and a new generation of editors is building for them.",
    author: "Inés Calvo",
    readTime: 9,
    published: "1d ago",
    image: cultureInstallation,
    imageAlt: "Abstract sculptural installation in a warmly lit gallery",
    body: [
      "The numbers were supposed to be final. Attention spans were shrinking, screens were getting smaller, and the essay — the patient, unfolding, nine-thousand-word essay — was a museum piece.",
      "Then, quietly, the curve bent. Independent publications built around long, rigorous writing are posting their best subscription numbers in years. Reading apps report that articles opened on phones are being finished at higher rates, not lower. The audience never left; it was simply never addressed.",
      "The editors driving the revival share a theory: scarcity. In a feed where everything is optimized for the next swipe, a piece that demands forty uninterrupted minutes has become a luxury good — a deliberate act in a distracted age.",
      "It is too early to call it a movement. But in the galleries, the small magazines, and the independent newsrooms, something old is becoming new again: the belief that a reader willing to be trusted with complexity will repay the trust.",
    ],
  },
  {
    slug: "slower-pivot",
    title: "A Slower Pivot",
    category: "Business",
    excerpt:
      "Central banks have stopped racing each other to cut rates, and the markets are learning to like the patience.",
    author: "Tomás Lindqvist",
    readTime: 6,
    published: "3h ago",
    image: businessDistrict,
    imageAlt: "Aerial view of a financial district at dusk",
    body: [
      "For two years, the world's central banks moved like a synchronized fleet: hike together, pause together, and signal together. This month, for the first time since the inflation shock, they are drifting apart — and traders say the silence is the story.",
      "The divergence reflects a fact that was true all along: there is no single global economy. Services inflation is sticky in Europe, cooling in Asia, and politically explosive in North America. A one-size monetary policy stopped fitting all three some time ago.",
      "Markets, remarkably, are calm. Analysts attribute the composure to clarity rather than comfort — forward guidance has become plainer, and the era of surprise moves appears to be over. Volatility indices are near decade lows even as policy paths diverge.",
      "The risk, veterans warn, is complacency. Divergent rates move currencies, and currencies move everything else. The slower pivot is easier to watch; it is not necessarily easier to survive.",
    ],
  },
  {
    slug: "chip-shortage",
    title: "The Chip Shortage That Never Quite Ended",
    category: "Tech",
    excerpt:
      "Automakers are still waiting months for parts that were supposed to be plentiful by now. The bottleneck has simply moved.",
    author: "Priya Raman",
    readTime: 4,
    published: "6h ago",
    image: techChips,
    imageAlt: "A stack of silicon wafers beside finished microchips",
    body: [
      "Officially, the great chip shortage ended in 2023. Try telling that to the procurement officer at a mid-size carmaker who is still being quoted nineteen-week lead times for a controller that used to sit in a warehouse.",
      "The shortage did not end; it migrated. The fabs that everyone built make the advanced chips that everyone talks about. The missing parts are the unglamorous ones — 40-nanometer controllers and power management ICs — where margins are thin and capacity never returned.",
      "Governments have noticed. New incentive packages increasingly target 'legacy nodes,' the industrial plumbing of the modern economy. But fabs take years, and the cars, appliances, and medical devices waiting on these chips do not.",
    ],
  },
  {
    slug: "night-sky-atlas",
    title: "A New Atlas of the Night Sky",
    category: "Tech",
    excerpt:
      "A decade of survey data has been stitched into the most detailed map of the cosmos ever made — and it is free to anyone on Earth.",
    author: "Sofia Marek",
    readTime: 7,
    published: "1d ago",
    image: techNightsky,
    imageAlt: "The Milky Way in a star-filled night sky",
    body: [
      "The new atlas is not a picture; it is a census. Sixteen billion stars, forty million galaxies, each with a measured distance, brightness, and motion — the product of a decade of nightly scanning from three observatories on two continents.",
      "Released this week under an open license, the data set is already reshaping research. Graduate students who once wrote proposals for telescope time are writing code instead, pointing their questions at the archive like librarians of the universe.",
      "The surprises are already arriving: a stream of stars threading through the galactic halo that no model predicted, and a strange, quiet void in the local cosmic neighborhood that is larger than theory says it should be.",
      "Astronomers call the map the field's great gift to its future. It will be mined for decades — most of its discoveries, they note, will be made by people not yet born.",
    ],
  },
  {
    slug: "four-day-week",
    title: "The Four-Day Week Goes Mainstream",
    category: "Business",
    excerpt:
      "What began as an experiment in a handful of firms is now standard policy in three industries — and the productivity data has believers.",
    author: "Hannah Beck",
    readTime: 5,
    published: "1d ago",
    image: businessOffice,
    imageAlt: "A sunlit modern office with people working calmly",
    body: [
      "The pilot programs were supposed to fail politely. Instead, two years on, the four-day week is the default in a growing list of sectors — software, design, and, most surprisingly, customer support.",
      "The mechanism, researchers say, is not magic but arithmetic. Meetings shrink, priorities sharpen, and the hundred tiny inefficiencies that pad a five-day week simply have no room to hide in four. Output per hour is up; total output, in most studies, is flat or better.",
      "The holdouts are now the ones explaining themselves. In hiring markets where both models compete, candidates increasingly read a five-day week as a signal about culture — and employers have noticed the résumé flow bending accordingly.",
    ],
  },
  {
    slug: "high-seas-treaty",
    title: "A New Treaty for the High Seas",
    category: "World",
    excerpt:
      "Twelve nations reach a landmark accord on digital governance of international waters — including the cables that carry the internet itself.",
    author: "Jonas Feld",
    readTime: 7,
    published: "2d ago",
    image: worldSeas,
    imageAlt: "A research vessel on the open ocean under stormy skies",
    body: [
      "The high seas have always been governed by the oldest and thinnest of rules: nobody owns them, everybody uses them. This week, twelve nations agreed to give that vacuum a legal spine — and, unexpectedly, the fiercest negotiations were not about fish.",
      "They were about cables. The fiber lines that carry nearly all international data lie on the seabed beyond any jurisdiction, unregulated and increasingly contested. The new accord creates the first inspection and repair regime for them, along with a registry of protected corridors.",
      "Environmental groups called the fisheries provisions modest but real: binding quotas for straddling stocks and a funding mechanism for enforcement patrols that, for the first time, does not depend on voluntary contributions.",
      "Ratification will take two years and the treaty still lacks several of the largest maritime powers. But negotiators describe a shift in tone that matters more than the text: the high seas, long treated as nowhere, are beginning to be governed as somewhere.",
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const byCategory = (category: Category) => articles.filter((a) => a.category === category);

export const trending: Article[] = ["chip-shortage", "long-form-revival", "slower-pivot", "night-sky-atlas"]
  .map((slug) => getArticle(slug))
  .filter((a): a is Article => Boolean(a));

export const CATEGORY_META: Record<Category, { tagline: string; description: string }> = {
  World: {
    tagline: "Dispatches from a changing planet",
    description:
      "On-the-ground reporting from our correspondents — conflict and diplomacy, climate and cities, and the treaties quietly redrawing borders.",
  },
  Tech: {
    tagline: "The machines, and the people behind them",
    description:
      "Computing, chips, space, and the engineering bets that will define the next decade — explained without the hype.",
  },
  Business: {
    tagline: "Markets, money, and the new economy",
    description:
      "Central banks, labor, and the firms rewriting the rules of work — sharp coverage of where the money is actually moving.",
  },
  Culture: {
    tagline: "Ideas, art, and the stories we tell",
    description:
      "Film, literature, design, and the long-form thinking underneath them — culture covered as news, not garnish.",
  },
};
