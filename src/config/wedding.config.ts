/**
 * Everything specific to one wedding lives in this file.
 * To set up a new wedding, edit the values below; no other file needs to change.
 *
 * Text fields typed as `Localized` accept either a plain string or
 * an object with per-language versions, e.g. { en: "Welcome", ml: "സ്വാഗതം", ta: "வரவேற்பு" }.
 * English is always the fallback.
 */

export type Lang = "en" | "ml" | "ta";
export type Localized = string | ({ en: string } & Partial<Record<Lang, string>>);
export type Phase = "before" | "during" | "after";
export type ThemeName = "kasavu" | "blush";
export type Side = "bride" | "groom";

export interface Person {
  name: string;
  nickname?: string;
  bio: Localized;
  photo?: string;
}

export interface WeddingEvent {
  id: string;
  name: Localized;
  start: string; // ISO with timezone offset
  end: string;
  venue: string;
  address: string;
  mapUrl: string;
  dressHint: Localized;
  description: Localized;
}

export interface FamilyMember {
  name: string;
  relation: string; // relation to the couple, e.g. "Bride's father"
  note: string;
  photo?: string;
}

export interface StoryEntry {
  date: string;
  title: Localized;
  text: Localized;
  photo: string;
}

export interface ChatLine {
  from: "bride" | "groom" | "system";
  text: string;
  time?: string;
}

export interface Ritual {
  id: string;
  title: Localized;
  subtitle?: string;
  summary: Localized;
  why: Localized;
  icon: "lamp" | "thali" | "steps" | "hands" | "leaf" | "turmeric" | "garland";
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface PhotoChallenge {
  id: string;
  title: string;
  hint: string;
  points: number;
}

export interface PredictionConfig {
  id: string;
  question: string;
  options: string[];
}

export interface Gift {
  id: string;
  title: string;
  description: string;
  unlockAt: number; // personal points needed
  kind: "film" | "note" | "photos";
  href: string;
}

export interface ThemeColors {
  bg: string;
  paper: string;
  gold: string;
  maroon: string;
  white: string;
  accent: string;
  green: string;
  ink: string;
  muted: string;
  bride: string;
  groom: string;
}

export const weddingConfig = {
  siteTitle: "Karthik & Anjali",
  hashtag: "#KarthikWedsAnjali",
  tagline: {
    en: "Two families, one sadya, a lifetime of stories.",
    ml: "രണ്ട് കുടുംബങ്ങൾ, ഒരു സദ്യ, ഒരു ജീവിതകാലത്തെ കഥകൾ.",
    ta: "இரு குடும்பங்கள், ஒரு விருந்து, வாழ்நாள் முழுவதும் கதைகள்.",
  } as Localized,

  bride: {
    name: "Anjali",
    nickname: "Anju",
    bio: {
      en: "Architect from Kochi who sketches every temple she visits and still keeps her first-standard drawing book.",
      ml: "കാണുന്ന ഓരോ അമ്പലവും വരച്ചുവയ്ക്കുന്ന കൊച്ചിക്കാരി ആർക്കിടെക്റ്റ്.",
      ta: "பார்க்கும் ஒவ்வொரு கோயிலையும் வரைந்து வைக்கும் கொச்சி கட்டடக் கலைஞர்.",
    },
    photo: "/demo/couple/anjali.svg",
  } as Person,
  groom: {
    name: "Karthik",
    nickname: "Kittu",
    bio: {
      en: "Software engineer from Coimbatore, filter-coffee loyalist, and the slowest eater at any sadya.",
      ml: "കോയമ്പത്തൂരിൽ നിന്നുള്ള സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയർ, ഫിൽറ്റർ കോഫി പ്രേമി.",
      ta: "கோயம்புத்தூர் மென்பொருள் பொறியாளர், ஃபில்டர் காபி ரசிகர்.",
    },
    photo: "/demo/couple/karthik.svg",
  } as Person,

  // Wedding day details
  date: "2026-11-15",
  muhurtham: { start: "2026-11-15T10:30:00+05:30", end: "2026-11-15T11:15:00+05:30", label: "10:30 – 11:15 AM IST" },
  venue: {
    name: "Nilavilakku Heritage Hall",
    address: "14 Temple Road, Panampilly Nagar, Kochi, Kerala 682036",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=9.9590,76.2930",
    coordinates: { lat: 9.959, lng: 76.293 },
  },

  /** Phase of the site. "auto" decides from the dates below. */
  phase: "auto" as Phase | "auto",
  duringWindow: { start: "2026-11-14T00:00:00+05:30", end: "2026-11-16T23:59:00+05:30" },
  firstAnniversary: "2027-11-15T10:30:00+05:30",

  events: [
    {
      id: "engagement",
      name: { en: "Engagement", ml: "വിവാഹ നിശ്ചയം", ta: "நிச்சயதார்த்தம்" },
      start: "2026-10-25T17:00:00+05:30",
      end: "2026-10-25T20:00:00+05:30",
      venue: "Sundaram residence, R.S. Puram",
      address: "22 Ramalinga Street, R.S. Puram, Coimbatore 641002",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=11.0089,76.9506",
      dressHint: { en: "Festive pastels. Silk welcome, comfort first.", ml: "പാസ്റ്റൽ നിറങ്ങൾ", ta: "பாஸ்டல் நிறங்கள்" },
      description: {
        en: "Exchange of rings and the formal 'yes' between the two families, followed by dinner on banana leaf.",
        ml: "മോതിരം മാറ്റലും ഇരു കുടുംബങ്ങളുടെയും സമ്മതവും, തുടർന്ന് അത്താഴം.",
        ta: "மோதிரம் மாற்றுதல், இரு குடும்பங்களின் சம்மதம், பின்னர் இரவு விருந்து.",
      },
    },
    {
      id: "haldi",
      name: { en: "Haldi & Mehendi", ml: "മഞ്ഞളും മൈലാഞ്ചിയും", ta: "மஞ்சள் & மெஹந்தி" },
      start: "2026-11-14T16:00:00+05:30",
      end: "2026-11-14T21:00:00+05:30",
      venue: "Nilavilakku Heritage Hall – Garden Courtyard",
      address: "14 Temple Road, Panampilly Nagar, Kochi, Kerala 682036",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.9590,76.2930",
      dressHint: { en: "Yellow and green. Wear something you don't mind getting turmeric on!", ml: "മഞ്ഞയും പച്ചയും", ta: "மஞ்சள் மற்றும் பச்சை" },
      description: {
        en: "Turmeric, music and mehendi cones. Both teams' first face-off happens here: bring your loudest cousins.",
        ml: "മഞ്ഞൾ, പാട്ട്, മൈലാഞ്ചി. ഇരു ടീമുകളുടെയും ആദ്യ മത്സരം ഇവിടെ.",
        ta: "மஞ்சள், இசை, மெஹந்தி. இரு அணிகளின் முதல் போட்டி இங்கே.",
      },
    },
    {
      id: "muhurtham",
      name: { en: "Muhurtham", ml: "മുഹൂർത്തം", ta: "முகூர்த்தம்" },
      start: "2026-11-15T10:30:00+05:30",
      end: "2026-11-15T11:15:00+05:30",
      venue: "Nilavilakku Heritage Hall – Main Mandapam",
      address: "14 Temple Road, Panampilly Nagar, Kochi, Kerala 682036",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.9590,76.2930",
      dressHint: { en: "Traditional: kasavu, silk, veshti. Please be seated by 10:15.", ml: "പരമ്പരാഗത വേഷം: കസവ്, പട്ട്", ta: "பாரம்பரிய உடை: பட்டு, வேட்டி" },
      description: {
        en: "The auspicious hour. Thali tying, garland exchange and saptapadi, followed by the wedding sadya at 12:00.",
        ml: "ശുഭ മുഹൂർത്തം. താലികെട്ട്, മാല മാറ്റൽ, സപ്തപദി. തുടർന്ന് 12 മണിക്ക് സദ്യ.",
        ta: "சுப முகூர்த்தம். தாலி கட்டுதல், மாலை மாற்றுதல், சப்தபதி. பின்னர் 12 மணிக்கு விருந்து.",
      },
    },
    {
      id: "reception",
      name: { en: "Reception", ml: "സ്വീകരണം", ta: "வரவேற்பு" },
      start: "2026-11-15T18:30:00+05:30",
      end: "2026-11-15T22:00:00+05:30",
      venue: "Nilavilakku Heritage Hall – Lawn",
      address: "14 Temple Road, Panampilly Nagar, Kochi, Kerala 682036",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.9590,76.2930",
      dressHint: { en: "Evening formal. Dance shoes recommended.", ml: "സായാഹ്ന വേഷം", ta: "மாலை நேர உடை" },
      description: {
        en: "Music, dinner and the Bride vs Groom final scoreboard reveal on the big screen.",
        ml: "സംഗീതം, അത്താഴം, ബ്രൈഡ് vs ഗ്രൂം ഫൈനൽ സ്കോർ.",
        ta: "இசை, இரவு விருந்து, மணமகள் vs மணமகன் இறுதி மதிப்பெண்.",
      },
    },
  ] as WeddingEvent[],

  families: {
    bride: [
      { name: "Ramesh Kumar", relation: "Bride's father", note: "Retired port engineer. Will tell you the history of every ship in Kochi harbour." },
      { name: "Lekha Ramesh", relation: "Bride's mother", note: "Music teacher. The reason there will be a veena recital at the reception." },
      { name: "Arjun Ramesh", relation: "Bride's younger brother", note: "Official photographer of the family, unofficial DJ. Find him near the speakers." },
      { name: "Saraswathi Amma", relation: "Bride's grandmother (Ammamma)", note: "Ninety-one and sharper than all of us. Ask her about the 1961 floods." },
      { name: "Gopinath", relation: "Bride's maternal uncle (Ammavan)", note: "Runs a spice shop in Mattancherry. The sadya pickles are his." },
      { name: "Sreeja Gopinath", relation: "Bride's aunt", note: "Organising the mehendi. Has opinions about your colour choices." },
      { name: "Meera Nair", relation: "Bride's best friend", note: "Architecture college roommate. Holder of all of Anjali's secrets." },
    ] as FamilyMember[],
    groom: [
      { name: "Sundaram Natarajan", relation: "Groom's father", note: "Textile businessman from Coimbatore. Has already bought too many silk veshtis." },
      { name: "Meenakshi Sundaram", relation: "Groom's mother", note: "Makes the best filter coffee in Tamil Nadu (she will confirm this)." },
      { name: "Divya Sundaram", relation: "Groom's elder sister", note: "Doctor in Chennai. Will be the first one crying, per family predictions." },
      { name: "Venkatesh", relation: "Groom's maternal uncle (Mama)", note: "Leads the Kasi Yatra joke every year. Carries an umbrella just for that." },
      { name: "Natarajan Thatha", relation: "Groom's grandfather", note: "Eighty-eight, still walks 5 km every morning. Ask him for his blessing." },
      { name: "Priya Venkatesh", relation: "Groom's cousin", note: "Captain of Team Groom. Very competitive. You've been warned." },
      { name: "Rahul Krishnan", relation: "Groom's best friend", note: "Engineering college batchmate who introduced them. Takes full credit." },
    ] as FamilyMember[],
  },

  story: [
    {
      date: "June 2019",
      title: { en: "A borrowed umbrella", ml: "കടം വാങ്ങിയ കുട", ta: "கடன் வாங்கிய குடை" },
      text: {
        en: "A monsoon evening at a tiny bookshop in Bengaluru. One umbrella, two strangers, and a promise to return it 'tomorrow'.",
        ml: "ബെംഗളൂരുവിലെ ഒരു ചെറിയ പുസ്തകക്കടയിൽ ഒരു മഴക്കാല സന്ധ്യ. ഒരു കുട, രണ്ടു അപരിചിതർ.",
        ta: "பெங்களூரு புத்தகக் கடையில் ஒரு மழைக்கால மாலை. ஒரு குடை, இரு அந்நியர்கள்.",
      },
      photo: "/demo/story/umbrella.svg",
    },
    {
      date: "December 2019",
      title: { en: "Filter coffee vs chai", ml: "ഫിൽറ്റർ കോഫിയോ ചായയോ", ta: "ஃபில்டர் காபியா டீயா" },
      text: {
        en: "Their first real argument, settled over a coffee crawl through Malleswaram. Nobody won. Both still claim victory.",
        ml: "ആദ്യത്തെ തർക്കം, മല്ലേശ്വരത്തെ കോഫി യാത്രയിൽ. ആരും ജയിച്ചില്ല.",
        ta: "முதல் வாக்குவாதம், மல்லேஸ்வரம் காபி பயணத்தில். யாரும் வெல்லவில்லை.",
      },
      photo: "/demo/story/coffee.svg",
    },
    {
      date: "April 2021",
      title: { en: "Long distance, longer calls", ml: "ദൂരം, നീണ്ട ഫോൺ വിളികൾ", ta: "தூரம், நீண்ட அழைப்புகள்" },
      text: {
        en: "Anjali moved back to Kochi, Karthik stayed in Bengaluru. Every night at 10, a call that was 'just five minutes'.",
        ml: "അഞ്ജലി കൊച്ചിയിലേക്ക്, കാർത്തിക് ബെംഗളൂരുവിൽ. എല്ലാ രാത്രിയും പത്തുമണിക്ക് ഒരു 'അഞ്ചു മിനിറ്റ്' കോൾ.",
        ta: "அஞ்சலி கொச்சிக்கு, கார்த்திக் பெங்களூருவில். ஒவ்வொரு இரவும் 10 மணிக்கு 'ஐந்து நிமிட' அழைப்பு.",
      },
      photo: "/demo/story/calls.svg",
    },
    {
      date: "January 2026",
      title: { en: "The question at Fort Kochi", ml: "ഫോർട്ട് കൊച്ചിയിലെ ചോദ്യം", ta: "ஃபோர்ட் கொச்சியில் கேள்வி" },
      text: {
        en: "Sunset by the Chinese fishing nets, a ring hidden inside a returned umbrella, and a very loud 'yes'.",
        ml: "ചീനവലകൾക്കരികിലെ അസ്തമയം, തിരികെ നൽകിയ കുടയ്ക്കുള്ളിൽ ഒരു മോതിരം, ഒരു വലിയ 'അതെ'.",
        ta: "சீன மீன்பிடி வலைகள் அருகே சூரிய அஸ்தமனம், குடைக்குள் மறைந்த மோதிரம், ஒரு உரத்த 'ஆம்'.",
      },
      photo: "/demo/story/proposal.svg",
    },
    {
      date: "November 2026",
      title: { en: "Two families, one mandapam", ml: "രണ്ടു കുടുംബം, ഒരു മണ്ഡപം", ta: "இரு குடும்பங்கள், ஒரு மண்டபம்" },
      text: {
        en: "Kerala sadya meets Kongu hospitality. We can't wait to celebrate with you in Kochi.",
        ml: "കേരള സദ്യയും കൊങ്ങു ആതിഥ്യവും. കൊച്ചിയിൽ നിങ്ങളെ കാത്തിരിക്കുന്നു.",
        ta: "கேரள சத்யாவும் கொங்கு விருந்தோம்பலும். கொச்சியில் உங்களுக்காக காத்திருக்கிறோம்.",
      },
      photo: "/demo/story/mandapam.svg",
    },
  ] as StoryEntry[],

  /** "How we met" chat reveal, shown one bubble per tap. */
  chat: [
    { from: "system", text: "June 14, 2019 · Bengaluru · heavy rain" },
    { from: "groom", text: "Excuse me… is that the last umbrella in this shop?", time: "6:42 PM" },
    { from: "bride", text: "It's my umbrella. The shop sells books, not umbrellas 😄", time: "6:42 PM" },
    { from: "groom", text: "Right. Yes. I knew that. My bus stop is just across the road…", time: "6:43 PM" },
    { from: "bride", text: "So is mine. Fine, we share. But you hold it, you're taller.", time: "6:43 PM" },
    { from: "groom", text: "Deal. I'm Karthik, by the way. From Coimbatore.", time: "6:45 PM" },
    { from: "bride", text: "Anjali. Kochi. And you just walked into a puddle.", time: "6:45 PM" },
    { from: "groom", text: "My bus is here. Can I borrow this? I'll return it tomorrow, same shop, same time.", time: "6:51 PM" },
    { from: "bride", text: "You'd better. It's my favourite umbrella.", time: "6:51 PM" },
    { from: "system", text: "He came back the next day. And the day after that. Seven years later, he finally returned it, with a ring inside. 💍" },
  ] as ChatLine[],

  rituals: [
    {
      id: "haldi",
      title: { en: "Haldi", ml: "മഞ്ഞൾ ചടങ്ങ്", ta: "மஞ்சள் சடங்கு" },
      subtitle: "Turmeric blessing",
      summary: {
        en: "Elders apply turmeric paste on the couple's face and arms the day before the wedding.",
        ml: "വിവാഹത്തിന്റെ തലേദിവസം മുതിർന്നവർ ദമ്പതികളുടെ മുഖത്തും കൈകളിലും മഞ്ഞൾ പുരട്ടുന്നു.",
        ta: "திருமணத்திற்கு முந்தைய நாள் பெரியவர்கள் மணமக்களின் முகத்திலும் கைகளிலும் மஞ்சள் பூசுவார்கள்.",
      },
      why: { en: "Turmeric is a symbol of purity and good health, and it gives the famous wedding glow.", ml: "മഞ്ഞൾ വിശുദ്ധിയുടെയും ആരോഗ്യത്തിന്റെയും പ്രതീകം.", ta: "மஞ்சள் தூய்மை மற்றும் ஆரோக்கியத்தின் அடையாளம்." },
      icon: "turmeric",
    },
    {
      id: "muhurtham",
      title: { en: "Muhurtham", ml: "മുഹൂർത്തം", ta: "முகூர்த்தம்" },
      subtitle: "The auspicious hour",
      summary: {
        en: "A time chosen by astrologers as the most auspicious moment for the couple to be wed.",
        ml: "വിവാഹത്തിനായി തിരഞ്ഞെടുക്കുന്ന ഏറ്റവും ശുഭകരമായ സമയം.",
        ta: "திருமணத்திற்காகத் தேர்ந்தெடுக்கப்படும் மிகவும் சுபமான நேரம்.",
      },
      why: { en: "Starting together at a good moment is believed to bless the marriage. Please be seated early!", ml: "നല്ല സമയത്ത് തുടങ്ങുന്നത് ദാമ്പത്യത്തിന് അനുഗ്രഹമാണ്.", ta: "நல்ல நேரத்தில் தொடங்குவது திருமண வாழ்வுக்கு ஆசீர்வாதம்." },
      icon: "lamp",
    },
    {
      id: "kanyadanam",
      title: { en: "Kanyadanam", ml: "കന്യാദാനം", ta: "கன்னிகாதானம்" },
      subtitle: "Placing hands together",
      summary: {
        en: "The bride's parents place her hand in the groom's, welcoming him as their son.",
        ml: "വധുവിന്റെ മാതാപിതാക്കൾ അവളുടെ കൈ വരന്റെ കൈയിൽ വയ്ക്കുന്നു.",
        ta: "மணமகளின் பெற்றோர் அவள் கையை மணமகனின் கையில் வைக்கிறார்கள்.",
      },
      why: { en: "It is a promise between two families as much as between two people.", ml: "ഇത് രണ്ടു കുടുംബങ്ങൾ തമ്മിലുള്ള വാഗ്ദാനമാണ്.", ta: "இது இரு குடும்பங்களுக்கிடையேயான வாக்குறுதி." },
      icon: "hands",
    },
    {
      id: "malai",
      title: { en: "Garland exchange", ml: "മാല മാറ്റൽ", ta: "மாலை மாற்றுதல்" },
      subtitle: "Maalai maatral",
      summary: {
        en: "The couple exchange jasmine and rose garlands, often three times, while cousins lift them high to make it hard.",
        ml: "ദമ്പതികൾ മുല്ലപ്പൂമാല മാറ്റുന്നു; ബന്ധുക്കൾ അവരെ ഉയർത്തി രസം കൂട്ടുന്നു.",
        ta: "மணமக்கள் மல்லிகை மாலைகளை மாற்றுகிறார்கள்; உறவினர்கள் அவர்களைத் தூக்கி விளையாடுவார்கள்.",
      },
      why: { en: "It shows mutual acceptance, and it's the most fun moment to cheer for your team.", ml: "പരസ്പര സ്വീകാര്യതയുടെ അടയാളം.", ta: "ஒருவரை ஒருவர் ஏற்றுக்கொள்வதன் அடையாளம்." },
      icon: "garland",
    },
    {
      id: "thali",
      title: { en: "Thali tying", ml: "താലികെട്ട്", ta: "தாலி கட்டுதல்" },
      subtitle: "Mangalsutra",
      summary: {
        en: "At the exact muhurtham, the groom ties the sacred thali around the bride's neck as drums and nadaswaram play.",
        ml: "മുഹൂർത്ത സമയത്ത് വരൻ വധുവിന്റെ കഴുത്തിൽ താലി കെട്ടുന്നു; ചെണ്ടയും നാദസ്വരവും മുഴങ്ങുന്നു.",
        ta: "முகூர்த்த நேரத்தில் கெட்டிமேளம் முழங்க மணமகன் மணமகளின் கழுத்தில் தாலி கட்டுகிறார்.",
      },
      why: { en: "This is the heart of the wedding. Guests shower the couple with flower petals and rice (akshata).", ml: "വിവാഹത്തിന്റെ ഹൃദയം. അതിഥികൾ പൂക്കളും അക്ഷതവും വർഷിക്കുന്നു.", ta: "திருமணத்தின் இதயம். விருந்தினர்கள் அட்சதை தூவுவார்கள்." },
      icon: "thali",
    },
    {
      id: "saptapadi",
      title: { en: "Saptapadi", ml: "സപ്തപദി", ta: "சப்தபதி" },
      subtitle: "Seven steps",
      summary: {
        en: "The couple take seven steps together around the sacred fire, one promise per step.",
        ml: "അഗ്നിക്കു ചുറ്റും ഒന്നിച്ച് ഏഴു ചുവടുകൾ, ഓരോന്നിനും ഒരു വാഗ്ദാനം.",
        ta: "அக்னியைச் சுற்றி ஏழு அடிகள், ஒவ்வொன்றிலும் ஒரு வாக்குறுதி.",
      },
      why: { en: "Food, strength, prosperity, happiness, family, seasons, and lifelong friendship.", ml: "ആഹാരം, ശക്തി, സമൃദ്ധി, സന്തോഷം, കുടുംബം, ഋതുക്കൾ, സൗഹൃദം.", ta: "உணவு, வலிமை, செழிப்பு, மகிழ்ச்சி, குடும்பம், பருவங்கள், நட்பு." },
      icon: "steps",
    },
    {
      id: "sadya",
      title: { en: "Sadya", ml: "സദ്യ", ta: "சத்யா விருந்து" },
      subtitle: "The feast on a banana leaf",
      summary: {
        en: "Over twenty dishes served on a banana leaf, from parippu to three kinds of payasam. Eat with your right hand!",
        ml: "വാഴയിലയിൽ ഇരുപതിലധികം വിഭവങ്ങൾ, പരിപ്പ് മുതൽ മൂന്നു തരം പായസം വരെ.",
        ta: "வாழை இலையில் இருபதுக்கும் மேற்பட்ட உணவுகள், பருப்பு முதல் மூன்று வகை பாயசம் வரை.",
      },
      why: { en: "Sharing a meal is the first thing the two families do together as one.", ml: "ഒന്നിച്ചുള്ള ആദ്യ ഭക്ഷണം.", ta: "ஒன்றாக உண்ணும் முதல் உணவு." },
      icon: "leaf",
    },
  ] as Ritual[],

  venueGuide: {
    parking: "Free parking for 120 cars in the hall basement. Overflow parking at St. Teresa's school ground (3 min walk), with valet from 9:30 AM.",
    restrooms: "Ground floor near the dining hall and first floor near the bridal room. Baby-changing room next to the reception desk.",
    accessibility: "Ramp at the main entrance and a lift to the mandapam floor. Wheelchairs available at the reception desk. Reserved front-row seating for elders.",
    food: [
      { label: "Welcome drinks & snacks", time: "9:30 AM" },
      { label: "Wedding sadya (three sittings)", time: "12:00 PM – 2:30 PM" },
      { label: "Evening tea", time: "4:30 PM" },
      { label: "Reception dinner", time: "7:30 PM onwards" },
    ],
    helplines: [
      { label: "Bride's side: Arjun", phone: "+91 90000 11111" },
      { label: "Groom's side: Priya", phone: "+91 90000 22222" },
      { label: "Venue desk", phone: "+91 90000 33333" },
    ],
  },

  quiz: [
    { q: "Where did Karthik and Anjali first meet?", options: ["A temple festival", "A bookshop in Bengaluru", "A college fest", "On a train to Chennai"], answer: 1, explain: "A tiny bookshop in Bengaluru, on a rainy evening in June 2019." },
    { q: "What did Karthik borrow from Anjali that day?", options: ["A pen", "A book", "Her umbrella", "Bus fare"], answer: 2, explain: "Her favourite umbrella. He 'returned' it seven years later with a ring inside." },
    { q: "What is Anjali's nickname at home?", options: ["Anju", "Ammu", "Chinnu", "Kuttu"], answer: 0, explain: "Everyone at home calls her Anju." },
    { q: "Coffee or chai: which side is Karthik on?", options: ["Chai, always", "Filter coffee", "Neither, only juice", "Whatever Anjali is having"], answer: 1, explain: "Filter coffee loyalist, thanks to his mother's legendary decoction." },
    { q: "Where did Karthik propose?", options: ["Marine Drive", "Munnar tea gardens", "Fort Kochi, by the fishing nets", "Ooty lake"], answer: 2, explain: "At sunset by the Chinese fishing nets in Fort Kochi." },
    { q: "What does Anjali do for a living?", options: ["Doctor", "Architect", "Lawyer", "Teacher"], answer: 1, explain: "She's an architect who sketches every temple she visits." },
    { q: "Which city is Karthik's family from?", options: ["Madurai", "Chennai", "Coimbatore", "Salem"], answer: 2, explain: "Coimbatore: textile city and home of Kongu hospitality." },
    { q: "What time was their famous nightly 'five-minute' call?", options: ["8 PM", "9 PM", "10 PM", "Midnight"], answer: 2, explain: "10 PM sharp. It was never five minutes." },
  ] as QuizQuestion[],

  challenges: [
    { id: "other-family", title: "Selfie with the other family", hint: "Find someone from the other side you met today and take a selfie together.", points: 20 },
    { id: "oldest", title: "Photo with the oldest relative", hint: "Ask for a blessing and a photo with the eldest guest you can find.", points: 20 },
    { id: "jasmine", title: "Jasmine everywhere", hint: "Capture the most beautiful jasmine garland or hair-flower you see.", points: 15 },
    { id: "sadya", title: "The perfect sadya leaf", hint: "Photograph a full banana leaf before the first bite.", points: 15 },
    { id: "dance", title: "Dance floor hero", hint: "Catch someone mid-dance at the reception.", points: 15 },
    { id: "matching", title: "Twinning", hint: "Find two guests wearing matching colours and photograph them together.", points: 10 },
  ] as PhotoChallenge[],

  predictions: [
    { id: "cry-first", question: "Who will cry first during the thali tying?", options: ["Anjali", "Karthik", "Divya (groom's sister)", "Lekha (bride's mother)"] },
    { id: "sweet", question: "Which sweet disappears first at the sadya?", options: ["Palada payasam", "Ada pradhaman", "Boli", "Pazham"] },
    { id: "late", question: "Who will be the last to arrive at the muhurtham?", options: ["Arjun", "Rahul", "Venkatesh Mama", "The photographer"] },
    { id: "dance", question: "Who will be first on the dance floor?", options: ["Priya", "Meera", "Natarajan Thatha", "The couple"] },
  ] as PredictionConfig[],

  gifts: [
    { id: "note", title: "A note from the couple", description: "A handwritten thank-you, just for players.", unlockAt: 30, kind: "note", href: "/films#note" },
    { id: "bts", title: "Behind the scenes", description: "Never-seen photos from the engagement.", unlockAt: 70, kind: "photos", href: "/gallery?tab=couple" },
    { id: "film", title: "The story film", description: "Our seven-year story, in three minutes.", unlockAt: 120, kind: "film", href: "/films#story" },
  ] as Gift[],

  thankYou: {
    en: "To everyone who travelled, cooked, cheered, cried and danced with us: thank you. You turned one day into a memory we will keep forever. With love, Karthik & Anjali.",
    ml: "ഞങ്ങളോടൊപ്പം യാത്ര ചെയ്ത, ആഘോഷിച്ച, കരഞ്ഞ, നൃത്തം ചെയ്ത എല്ലാവർക്കും നന്ദി. സ്നേഹത്തോടെ, കാർത്തിക്കും അഞ്ജലിയും.",
    ta: "எங்களுடன் பயணித்து, கொண்டாடி, அழுது, ஆடிய அனைவருக்கும் நன்றி. அன்புடன், கார்த்திக் & அஞ்சலி.",
  } as Localized,

  films: [
    { id: "save-the-date", title: "Save the date", poster: "/demo/films/save-the-date.svg", src: "", status: "available" as const, note: "Released October 2026" },
    { id: "highlights", title: "Wedding highlights", poster: "/demo/films/highlights.svg", src: "", status: "after" as const, note: "Coming soon after the wedding" },
    { id: "reception", title: "Reception reel", poster: "/demo/films/reception.svg", src: "", status: "after" as const, note: "Coming soon after the wedding" },
  ],

  /** Background music for the story preview. Leave empty for a gentle generated tanpura-style drone. */
  storyMusic: "",

  theme: "kasavu" as ThemeName,
  themes: {
    kasavu: {
      bg: "251 246 236",
      paper: "255 252 245",
      gold: "201 162 75",
      maroon: "107 31 42",
      white: "255 255 255",
      accent: "232 163 23",
      green: "78 107 58",
      ink: "43 28 24",
      muted: "110 92 80",
      bride: "176 48 82",
      groom: "31 92 122",
    },
    blush: {
      bg: "253 244 243",
      paper: "255 250 249",
      gold: "183 132 112",
      maroon: "142 59 79",
      white: "255 255 255",
      accent: "226 140 150",
      green: "106 125 98",
      ink: "54 32 38",
      muted: "120 92 98",
      bride: "190 70 110",
      groom: "70 100 140",
    },
  } satisfies Record<ThemeName, ThemeColors>,

  languages: ["en", "ml", "ta"] as Lang[],
  defaultLanguage: "en" as Lang,

  /**
   * Demo passcode for upload/admin areas. In demo mode this is checked in the browser.
   * In Supabase mode the admin passcode comes from the ADMIN_PASSCODE server variable instead.
   */
  adminPasscode: "1511",
  uploadPasscode: "", // leave empty for open uploads

  autoApproveDefault: false,

  modules: {
    story: true,
    chat: true,
    families: true,
    events: true,
    rituals: true,
    venue: true,
    rsvp: true,
    gallery: true,
    upload: true,
    blessings: true,
    play: true,
    live: true,
    films: true,
    capsule: true,
  },
};

export type ModuleKey = keyof typeof weddingConfig.modules;
export type WeddingConfig = typeof weddingConfig;
