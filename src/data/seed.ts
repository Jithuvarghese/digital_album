import { weddingConfig } from "@/config/wedding.config";
import type { Blessing, CapsuleMessage, Guest, Photo, Prediction, PredictionVote, Rsvp, ScoreEvent, Settings, Team } from "./types";

/** Sample data so the demo looks alive on first load. Timestamps are relative to "now". */

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export function defaultSettings(): Settings {
  return {
    phase: weddingConfig.phase,
    theme: weddingConfig.theme,
    autoApprove: weddingConfig.autoApproveDefault,
    modulesEnabled: { ...weddingConfig.modules },
    gameStatus: "open",
    winner: null,
  };
}

const photoCaptions = [
  "Lamp lighting", "Mandapam ready", "Sadya leaf", "Jasmine strings", "Golden hour", "Cousins squad",
  "Haldi giggles", "Garland exchange", "Pookalam", "Nadaswaram", "Mehendi hands", "Grandparents",
  "Thali moment", "Akshata shower", "Fort Kochi sunset", "Dance floor", "Coffee break", "Team Bride",
  "Team Groom", "Kasavu details", "First look", "Payasam round two", "Family portrait", "Just married",
];

const guestUploaders = ["Arjun", "Priya V.", "Meera", "Rahul K.", "Divya", "Sreeja aunty", "Nikhil", "Lakshmi", "Vishnu", "Ananya"];

export function seedPhotos(): Photo[] {
  return photoCaptions.map((caption, i) => {
    const n = String(i + 1).padStart(2, "0");
    const isCouple = i < 8;
    const team: Team | null = isCouple ? null : i % 2 ? "groom" : "bride";
    return {
      id: `seed-photo-${n}`,
      url: `/demo/photos/p${n}.svg`,
      thumbUrl: `/demo/photos/p${n}.svg`,
      uploaderName: isCouple ? "Karthik & Anjali" : guestUploaders[i % guestUploaders.length],
      caption,
      team,
      status: i === 22 || i === 23 ? "pending" : "approved",
      likes: [12, 31, 8, 22, 17, 5, 41, 27, 9, 14, 36, 19, 6, 25, 11, 3, 15, 29, 7, 21, 10, 18, 4, 2][i],
      source: isCouple ? "couple" : "guest",
      createdAt: minutesAgo(600 - i * 22),
    };
  });
}

export function seedBlessings(): Blessing[] {
  const list: Array<Omit<Blessing, "id" | "createdAt" | "status"> & { pending?: boolean }> = [
    { name: "Saraswathi Amma", relation: "Anjali's Ammamma", message: "My Anju, you were the girl who drew houses on every wall of our tharavad. Now go build your own, full of light and laughter. God bless you both.", style: "gold" },
    { name: "Natarajan", relation: "Karthik's Thatha", message: "Karthik, treat her like the Goddess of your home. Anjali, keep him on time. Long life and happiness to you both.", style: "gold" },
    { name: "Meera Nair", relation: "Anjali's college roommate", message: "From sharing one tiny hostel room to watching you marry the umbrella guy. I'm so happy I could cry. Actually I am crying.", style: "floral" },
    { name: "Rahul Krishnan", relation: "Karthik's best friend", message: "For the record, I told him to go to that bookshop. You're welcome. Love you both, machaan.", style: "simple" },
    { name: "ലേഖ രമേശ്", relation: "അഞ്ജലിയുടെ അമ്മ", message: "എന്റെ മോൾക്കും കാർത്തിക്കിനും എല്ലാ ഐശ്വര്യങ്ങളും നേരുന്നു. എന്നും സ്നേഹത്തോടെ ഒന്നിച്ചു ജീവിക്കുക.", style: "floral" },
    { name: "மீனாட்சி சுந்தரம்", relation: "கார்த்திக்கின் அம்மா", message: "அஞ்சலி, எங்கள் வீட்டுக்கு வரும் மகாலட்சுமி நீ. இருவரும் நீண்ட ஆயுளுடன் சந்தோஷமாக வாழ வாழ்த்துகிறேன்.", style: "gold" },
    { name: "Divya Sundaram", relation: "Karthik's sister", message: "Finally someone who will make him eat his vegetables. Welcome to the family, Anjali. You're the sister I always wanted.", style: "floral" },
    { name: "Gopinath", relation: "Anjali's Ammavan", message: "May your life be like a good sadya: many flavours, perfectly balanced, and always ending with something sweet.", style: "simple" },
    { name: "Ananya Iyer", relation: "Anjali's office colleague", message: "The office will miss your 4 PM chai breaks for a week. Congratulations, and send us the sadya photos!", style: "simple" },
    { name: "Venkatesh Mama", relation: "Karthik's Mama", message: "I have the Kasi Yatra umbrella ready. Karthik, I'll try to convince you to become a sanyasi, but I already know who wins. Blessings!", style: "simple" },
    { name: "സ്രീജ ഗോപിനാഥ്", relation: "അഞ്ജലിയുടെ ആന്റി", message: "മൈലാഞ്ചി പോലെ നിങ്ങളുടെ സ്നേഹവും ഓരോ ദിവസവും കൂടുതൽ തെളിയട്ടെ.", style: "floral" },
    { name: "Priya Venkatesh", relation: "Karthik's cousin, Team Groom captain", message: "Love you both, but Team Groom is winning this game. Congratulations Anna and Anni!", style: "simple" },
    { name: "பிரகாஷ்", relation: "Karthik's school friend", message: "பள்ளிக் காலம் முதல் இன்று வரை நீ என்றும் நல்ல நண்பன். உங்கள் இருவருக்கும் இனிய திருமண வாழ்த்துகள்!", style: "gold" },
    { name: "The Kumar family", relation: "Neighbours in Panampilly Nagar", message: "We watched Anju grow up cycling down our lane. So proud of the woman she's become. Wishing you a lifetime of happy monsoons.", style: "floral" },
    { name: "Sanjay", relation: "Karthik's teammate", message: "Congrats on the best merge of your life. No conflicts, only love. 🎉", style: "simple", pending: true },
  ];
  return list.map(({ pending, ...b }, i) => ({
    ...b,
    id: `seed-blessing-${i + 1}`,
    status: pending ? "pending" : "approved",
    createdAt: minutesAgo(900 - i * 47),
  }));
}

const guestNames: Array<[string, Team]> = [
  ["Priya V.", "groom"], ["Arjun", "bride"], ["Meera", "bride"], ["Rahul K.", "groom"], ["Divya", "groom"],
  ["Sreeja aunty", "bride"], ["Nikhil", "bride"], ["Lakshmi", "groom"], ["Vishnu", "bride"], ["Ananya", "bride"],
  ["Prakash", "groom"], ["Kavya", "bride"], ["Sanjay", "groom"], ["Revathi", "groom"], ["Gokul", "bride"],
  ["Harini", "groom"], ["Aditya", "bride"], ["Swathi", "groom"], ["Joseph", "bride"], ["Bala", "groom"],
];
const guestPoints = [145, 130, 118, 104, 96, 88, 80, 72, 66, 60, 55, 48, 44, 40, 35, 30, 24, 20, 15, 10];

export function seedGuests(): Guest[] {
  return guestNames.map(([displayName, team], i) => ({
    id: `seed-guest-${i + 1}`,
    displayName,
    team,
    points: guestPoints[i],
    createdAt: minutesAgo(1000 - i * 30),
  }));
}

export function seedScores(guests: Guest[]): ScoreEvent[] {
  const sources = ["quiz", "challenge", "match", "prediction"] as const;
  const events: ScoreEvent[] = [];
  guests.forEach((g, gi) => {
    let left = g.points;
    let k = 0;
    while (left > 0) {
      const pts = Math.min(left, [40, 20, 25, 5][k % 4]);
      events.push({
        id: `seed-score-${gi}-${k}`,
        guestId: g.id,
        team: g.team,
        source: sources[k % 4],
        points: pts,
        createdAt: minutesAgo(800 - gi * 20 - k * 3),
      });
      left -= pts;
      k++;
    }
  });
  return events;
}

export function seedRsvps(): Rsvp[] {
  const rows: Array<Omit<Rsvp, "id" | "createdAt">> = [
    { name: "Ravi & Shanthi Menon", attending: true, guestCount: 2, side: "bride", meal: "veg", note: "Wouldn't miss Anju's big day!" },
    { name: "Prakash Raman", attending: true, guestCount: 1, side: "groom", meal: "veg", note: "" },
    { name: "Joseph Thomas", attending: true, guestCount: 4, side: "bride", meal: "non-veg", note: "Coming with the kids, please save us seats near the back." },
    { name: "Harini Balaji", attending: false, guestCount: 0, side: "groom", meal: "veg", note: "In the US that week, sending all my love. Will watch the live photos!" },
    { name: "Kavya Suresh", attending: true, guestCount: 2, side: "both", meal: "jain", note: "" },
    { name: "Aditya Nair", attending: true, guestCount: 3, side: "bride", meal: "veg", note: "Grandmother needs wheelchair access." },
  ];
  return rows.map((r, i) => ({ ...r, id: `seed-rsvp-${i + 1}`, createdAt: minutesAgo(5000 - i * 400) }));
}

export function seedCapsule(): CapsuleMessage[] {
  const unlockAt = weddingConfig.firstAnniversary;
  return [
    { name: "Meera", message: "Year one check-in: has he returned any more umbrellas? Tell me everything over coffee.", unlockAt },
    { name: "Arjun", message: "Chechi, I hope year one was the best one yet. Kittu anna, thanks for putting up with her. Love you both.", unlockAt },
    { name: "Divya", message: "Happy first anniversary! Remember to plan the trip to Hampi you two kept talking about.", unlockAt },
    { name: "Rahul", message: "One year down. Still taking full credit for introducing you.", unlockAt },
    { name: "Lekha amma", message: "My dears, may every anniversary feel as happy as the wedding day.", unlockAt },
  ].map((c, i) => ({ ...c, id: `seed-capsule-${i + 1}`, createdAt: minutesAgo(3000 - i * 100) }));
}

export function seedPredictions(): Prediction[] {
  return weddingConfig.predictions.map((p) => ({ ...p, revealedAnswer: null }));
}

export function seedVotes(guests: Guest[]): PredictionVote[] {
  const votes: PredictionVote[] = [];
  weddingConfig.predictions.forEach((p, pi) => {
    guests.slice(0, 14).forEach((g, gi) => {
      votes.push({
        id: `seed-vote-${pi}-${gi}`,
        predictionId: p.id,
        guestId: g.id,
        team: g.team,
        option: (gi * (pi + 1) + pi) % p.options.length,
        createdAt: minutesAgo(700 - gi * 5),
      });
    });
  });
  return votes;
}

export function buildSeed() {
  const guests = seedGuests();
  return {
    photos: seedPhotos(),
    blessings: seedBlessings(),
    guests,
    scores: seedScores(guests),
    rsvps: seedRsvps(),
    capsule: seedCapsule(),
    predictions: seedPredictions(),
    votes: seedVotes(guests),
    settings: defaultSettings(),
  };
}

export type SeedData = ReturnType<typeof buildSeed>;
