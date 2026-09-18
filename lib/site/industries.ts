// Structured industry starters. Each one drives three surfaces from the same
// data: the landing page (/websites/[slug]), the sample design (/examples/[slug]),
// and, later, the production template chosen for a customer's business.
//
// Everything in `sample` is a clearly-labeled design concept: fictional business,
// reserved 555-01xx phone numbers, and no reviews, awards, years-in-business, or
// statistics, because none of it is real.

export type CtaKind = "call" | "book" | "quote" | "visit" | "text";

export interface SampleSite {
  businessName: string;
  tagline: string;
  about: string;
  services: { name: string; blurb: string }[];
  highlights: string[]; // what the website itself does for visitors
  ctaLabel: string;
  ctaKind: CtaKind;
  hours: string;
  address: string;
  phone: string;
  tokens: {
    accent: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    heading: "serif" | "sans";
    radius: string;
  };
}

export interface IndustryConfig {
  slug: string;
  name: string; // plural, for headings
  singular: string;
  templateKey: string;
  headline: string;
  intro: string;
  problem: string;
  features: string[];
  faqs: { q: string; a: string }[];
  sample: SampleSite;
}

const PHONE = "(555) 555-0142";
const ADDRESS = "123 Main Street, Your City";

export const INDUSTRIES: IndustryConfig[] = [
  {
    slug: "barbers",
    name: "Barbershops",
    singular: "barbershop",
    templateKey: "BARBER_TEMPLATE",
    headline: "A website that fills your chair, not just your inbox.",
    intro: "Clients want to see your cuts, know your prices, and book without a phone tag. Give them all three on one clean page.",
    problem: "Most barbers rely on Instagram and word of mouth. New clients can't easily see services, hours, or how to book, so they pick the shop that makes it easy.",
    features: [
      "A service menu with a booking button that links to the tool you already use",
      "A photo gallery section for your best cuts",
      "Hours and a map so walk-ins can find you",
      "Tap-to-call and tap-to-text on every phone",
    ],
    faqs: [
      { q: "Can it link to my booking app?", a: "Yes. Send us your booking link (Squire, Booksy, Calendly, and similar) and the Book button goes straight to it." },
      { q: "Can I show my cuts?", a: "Yes. Share photos in your intake and we'll build a gallery section around them." },
      { q: "Do I need to keep my Instagram?", a: "Keep it. We'll link your Instagram from the site so each one helps the other." },
    ],
    sample: {
      businessName: "Sample Barbershop",
      tagline: "Sharp cuts. Easy booking.",
      about: "A clean one-page site for a neighborhood barbershop: services up front, a clear Book button, and everything a new client needs to find you.",
      services: [
        { name: "Haircut", blurb: "Classic and modern cuts, finished clean." },
        { name: "Beard trim", blurb: "Shaped and lined up." },
        { name: "Cut and beard", blurb: "The full refresh." },
        { name: "Kids cut", blurb: "Patient, quick, and clean." },
      ],
      highlights: ["Book in one tap", "See services at a glance", "Find the shop and get directions"],
      ctaLabel: "Book a cut",
      ctaKind: "book",
      hours: "Tue to Sat, 9 am to 6 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#c8a35a", bg: "#111111", surface: "#1b1b1b", text: "#f5f1e8", muted: "#a8a196", heading: "serif", radius: "6px" },
    },
  },
  {
    slug: "salons",
    name: "Beauty salons",
    singular: "beauty salon",
    templateKey: "SALON_TEMPLATE",
    headline: "Show your work. Let clients book themselves.",
    intro: "Beauty is visual, and clients decide fast. A polished page with your services and an easy booking path turns browsers into appointments.",
    problem: "Salons often have great work but no home for it. Clients can't tell what you offer or how to book, and a scattered social page isn't a first impression you control.",
    features: [
      "A services list grouped the way clients think about them",
      "A gallery for your best work",
      "A booking button that opens your scheduling tool",
      "Your hours, address, and directions in one tap",
    ],
    faqs: [
      { q: "Can I list my services and prices?", a: "Yes. Give us your list in the intake, or skip prices if you'd rather quote in person." },
      { q: "Can clients book online?", a: "If you use a booking tool, we'll link your Book button to it. If you take bookings by phone or text, the button calls or texts you instead." },
      { q: "Is it good on phones?", a: "It's built for phones first, since most clients will find you there." },
    ],
    sample: {
      businessName: "Sample Beauty Studio",
      tagline: "Hair, nails, and skin, all in one place.",
      about: "A soft, modern one-page site for a salon: your services grouped clearly, your work on display, and one obvious way to book.",
      services: [
        { name: "Hair styling", blurb: "Cuts, color, and finishing." },
        { name: "Nails", blurb: "Manicures and pedicures." },
        { name: "Skin care", blurb: "Facials and treatments." },
        { name: "Brows and lashes", blurb: "Shaped and defined." },
      ],
      highlights: ["Services grouped clearly", "Book without calling", "Directions in one tap"],
      ctaLabel: "Book an appointment",
      ctaKind: "book",
      hours: "Mon to Sat, 10 am to 7 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#b5546b", bg: "#fbf6f4", surface: "#ffffff", text: "#2a1f22", muted: "#7b6b6f", heading: "serif", radius: "16px" },
    },
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    singular: "restaurant",
    templateKey: "RESTAURANT_TEMPLATE",
    headline: "Put your menu, hours, and directions where hungry people look first.",
    intro: "People search on their phones, right now, hungry. Make your menu, hours, and phone number impossible to miss.",
    problem: "Diners bounce when they can't find a menu or hours. A PDF menu buried on a social page loses the customer who was ready to come in tonight.",
    features: [
      "Your menu on the page in a readable layout, not a downloadable PDF",
      "Hours, address, and a map with directions",
      "Tap-to-call for reservations or takeout",
      "Links to your ordering or reservation tools",
    ],
    faqs: [
      { q: "Can you put my menu on the site?", a: "Yes. Send it as text, a photo, or a PDF and we'll lay it out so it reads well on a phone." },
      { q: "Can it link to online ordering?", a: "Yes. We'll link your Order button to the service you already use." },
      { q: "What if my menu changes?", a: "Tell us the changes. Small updates after launch can be handled through an optional care plan." },
    ],
    sample: {
      businessName: "Sample Kitchen",
      tagline: "Good food, easy to find.",
      about: "A one-page site for a restaurant: the menu, the hours, and a call button, so a hungry visitor knows exactly what to do.",
      services: [
        { name: "Lunch", blurb: "Weekday specials and favorites." },
        { name: "Dinner", blurb: "Shared plates and mains." },
        { name: "Takeout", blurb: "Order ahead and pick up." },
        { name: "Catering", blurb: "Trays for your next event." },
      ],
      highlights: ["Menu readable on any phone", "Call to order in one tap", "Hours and directions up front"],
      ctaLabel: "Call to order",
      ctaKind: "call",
      hours: "Daily, 11 am to 9 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#d9622b", bg: "#fff8ef", surface: "#ffffff", text: "#2c1a0f", muted: "#7a6552", heading: "serif", radius: "12px" },
    },
  },
  {
    slug: "contractors",
    name: "Contractors",
    singular: "contractor",
    templateKey: "CONTRACTOR_TEMPLATE",
    headline: "Look like the pro you are before you ever pick up the phone.",
    intro: "Homeowners compare a few contractors before they call anyone. A clear, credible page decides who gets the call.",
    problem: "Great tradespeople lose jobs to competitors with better first impressions. Without a site, customers can't see what you do, where you work, or how to ask for a quote.",
    features: [
      "A clear list of the work you do and the areas you serve",
      "A request-a-quote button and tap-to-call",
      "A project photo section for your finished work",
      "Contact details that are easy to find on a job site phone",
    ],
    faqs: [
      { q: "Can I show my past jobs?", a: "Yes. Share photos in your intake and we'll build a project gallery." },
      { q: "Can it list my service area?", a: "Yes. Tell us the towns or counties you cover and we'll list them." },
      { q: "Will you add licenses or insurance?", a: "Only what you give us. We never invent credentials, so send exactly what you'd like shown." },
    ],
    sample: {
      businessName: "Sample Home Services",
      tagline: "Quality work. Clear quotes.",
      about: "A straightforward one-page site for a contractor: what you do, where you work, and a fast way to ask for a quote.",
      services: [
        { name: "Repairs", blurb: "Fixes done right the first time." },
        { name: "Remodeling", blurb: "Kitchens, baths, and more." },
        { name: "Decks and fences", blurb: "Built to last." },
        { name: "Free estimates", blurb: "Tell us about the job." },
      ],
      highlights: ["Ask for a quote in one tap", "Services and areas at a glance", "Easy to call from a phone"],
      ctaLabel: "Request a quote",
      ctaKind: "quote",
      hours: "Mon to Fri, 7 am to 5 pm",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#e08a1e", bg: "#f4f5f7", surface: "#ffffff", text: "#1c2430", muted: "#5d6775", heading: "sans", radius: "8px" },
    },
  },
  {
    slug: "pressure-washing",
    name: "Pressure washing companies",
    singular: "pressure washing company",
    templateKey: "PRESSURE_WASHING_TEMPLATE",
    headline: "Turn before-and-after photos into booked jobs.",
    intro: "Your best marketing is the transformation. Give it a home, a price conversation, and a call button.",
    problem: "Pressure washing sells on visible results, but most operators have nowhere to show them. Customers can't see proof or find a quick way to get a price.",
    features: [
      "A before-and-after gallery section for your best jobs",
      "A list of surfaces you clean: driveways, siding, decks, and more",
      "Request-a-quote and tap-to-text buttons",
      "Your service area and hours",
    ],
    faqs: [
      { q: "Can I show before-and-after photos?", a: "Yes. Send your best pairs and we'll build a gallery around them." },
      { q: "Can customers text me a photo for a quote?", a: "We'll add a Text button so they can message you straight from the page." },
      { q: "Do you write the service descriptions?", a: "Yes, based on what you tell us you offer. You review everything in the preview." },
    ],
    sample: {
      businessName: "Sample Pressure Washing",
      tagline: "Clean surfaces. Fast quotes.",
      about: "A bold one-page site for a pressure washing business: the surfaces you clean, your work on display, and a quick way to get a price.",
      services: [
        { name: "Driveways", blurb: "Concrete restored." },
        { name: "House washing", blurb: "Siding cleaned safely." },
        { name: "Decks and patios", blurb: "Ready for the season." },
        { name: "Fences", blurb: "Grime removed." },
      ],
      highlights: ["Text for a quote", "Before-and-after gallery", "Service area at a glance"],
      ctaLabel: "Text for a quote",
      ctaKind: "text",
      hours: "Mon to Sat, 8 am to 6 pm",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#1aa3d9", bg: "#0e1a24", surface: "#15263a", text: "#eef6fb", muted: "#93a9bb", heading: "sans", radius: "10px" },
    },
  },
  {
    slug: "landscaping",
    name: "Landscaping companies",
    singular: "landscaping company",
    templateKey: "LANDSCAPER_TEMPLATE",
    headline: "Let your yard work do the selling.",
    intro: "Curb appeal is visual. Show it, explain what you offer, and make asking for an estimate simple.",
    problem: "Landscapers do beautiful work that stays hidden in a phone camera roll. Without a site, homeowners can't compare you or request an estimate.",
    features: [
      "A project gallery for lawns, beds, patios, and more",
      "Seasonal and recurring services explained clearly",
      "An estimate request button and tap-to-call",
      "Your service area and contact details",
    ],
    faqs: [
      { q: "Can I list seasonal services?", a: "Yes. Tell us what you offer each season and we'll organize it." },
      { q: "Can I show my projects?", a: "Yes. Share photos and we'll build a gallery." },
      { q: "Can it show my service area?", a: "Yes. Give us the towns you cover and we'll list them." },
    ],
    sample: {
      businessName: "Sample Landscaping",
      tagline: "Lawns and yards, handled.",
      about: "A fresh, green one-page site for a landscaper: services by season, your projects on display, and an easy estimate request.",
      services: [
        { name: "Lawn care", blurb: "Mowing, edging, and upkeep." },
        { name: "Garden beds", blurb: "Planting and mulching." },
        { name: "Patios and walkways", blurb: "Hardscape that lasts." },
        { name: "Seasonal cleanup", blurb: "Spring and fall refreshes." },
      ],
      highlights: ["Request an estimate in one tap", "Projects on display", "Services by season"],
      ctaLabel: "Get an estimate",
      ctaKind: "quote",
      hours: "Mon to Sat, 7 am to 5 pm",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#3f8f4b", bg: "#f3f8f1", surface: "#ffffff", text: "#182417", muted: "#5a6b58", heading: "sans", radius: "14px" },
    },
  },
  {
    slug: "auto-detailing",
    name: "Auto detailing businesses",
    singular: "auto detailing business",
    templateKey: "AUTO_DETAILING_TEMPLATE",
    headline: "Make your shine the first thing customers see.",
    intro: "Detailing is a premium service, so your page has to look premium. Show the results and make booking effortless.",
    problem: "Detailers lose customers to whoever looks most polished online. Without a clear page, packages are confusing and booking takes too many messages.",
    features: [
      "Your packages laid out clearly, from basic to full detail",
      "A results gallery",
      "A booking or text-to-book button",
      "Your location or mobile service area",
    ],
    faqs: [
      { q: "Can I list my packages?", a: "Yes. We'll lay out each package and what it covers, with prices if you'd like them shown." },
      { q: "I'm mobile. Can it say that?", a: "Yes. We'll show your service area instead of a shop address." },
      { q: "Can customers book from the site?", a: "We'll link your Book button to your scheduling tool, or to call and text if you book that way." },
    ],
    sample: {
      businessName: "Sample Auto Detailing",
      tagline: "Showroom finish, every time.",
      about: "A sleek one-page site for a detailer: clear packages, your results on display, and a simple way to book.",
      services: [
        { name: "Exterior detail", blurb: "Wash, clay, and protect." },
        { name: "Interior detail", blurb: "Deep clean and refresh." },
        { name: "Full detail", blurb: "Inside and out." },
        { name: "Ceramic coating", blurb: "Long-lasting protection." },
      ],
      highlights: ["Packages explained clearly", "Book in a couple of taps", "Results on display"],
      ctaLabel: "Book a detail",
      ctaKind: "book",
      hours: "Mon to Sat, 8 am to 6 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#e5382f", bg: "#0d0d0f", surface: "#18181c", text: "#f4f4f5", muted: "#9a9aa3", heading: "sans", radius: "6px" },
    },
  },
  {
    slug: "realtors",
    name: "Realtors",
    singular: "realtor",
    templateKey: "REAL_ESTATE_TEMPLATE",
    headline: "Your own home base, separate from the brokerage page.",
    intro: "Buyers and sellers look you up before they call. Give them a page that's yours, with a clear way to start the conversation.",
    problem: "Agents are usually just one profile among hundreds on a brokerage site. Without your own page, it's hard to stand out or control what people see first.",
    features: [
      "An about section that introduces you as a person",
      "Areas you serve and how you help buyers and sellers",
      "Call, text, and email buttons",
      "Links to your listings and social profiles",
    ],
    faqs: [
      { q: "Can it show my listings?", a: "We'll link to your listings on your brokerage or MLS pages. We don't copy listing data onto the site." },
      { q: "Can I include my brokerage?", a: "Yes, with the name and details you give us." },
      { q: "Will you invent stats or awards?", a: "Never. We only show what you provide and can stand behind." },
    ],
    sample: {
      businessName: "Sample Realty",
      tagline: "Helping you buy and sell with confidence.",
      about: "A polished personal-brand page for a realtor: who you are, where you work, and an easy way to reach out.",
      services: [
        { name: "Buying", blurb: "Find the right home." },
        { name: "Selling", blurb: "Plan and price your sale." },
        { name: "Market questions", blurb: "Ask what you're wondering." },
        { name: "Relocation", blurb: "Moving to the area? Start here." },
      ],
      highlights: ["Call, text, or email in one tap", "Areas served at a glance", "Links to listings and socials"],
      ctaLabel: "Get in touch",
      ctaKind: "call",
      hours: "By appointment",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#1f4e79", bg: "#f7f9fb", surface: "#ffffff", text: "#132133", muted: "#5a6a7c", heading: "serif", radius: "8px" },
    },
  },
  {
    slug: "photographers",
    name: "Photographers",
    singular: "photographer",
    templateKey: "PHOTOGRAPHER_TEMPLATE",
    headline: "Your portfolio, presented like it deserves to be.",
    intro: "Clients hire you after seeing your work. Give them a fast, beautiful place to see it and a clear way to inquire.",
    problem: "Photographers often send prospects to a social feed that buries their best work. A dedicated page shows the work first and makes inquiries simple.",
    features: [
      "A portfolio gallery built around your strongest images",
      "Your packages or session types explained simply",
      "An inquiry button and contact details",
      "Links to your social profiles",
    ],
    faqs: [
      { q: "Can it hold a lot of photos?", a: "Our one-page website includes a curated gallery. For a large multi-page portfolio we'd scope a bigger build." },
      { q: "Can people inquire about a shoot?", a: "Yes. The inquiry button can call, text, email, or open a form." },
      { q: "Will it be fast with big images?", a: "We optimize images so the page loads quickly on a phone." },
    ],
    sample: {
      businessName: "Sample Photo Studio",
      tagline: "Portraits, events, and everything in between.",
      about: "A minimal, image-first one-page site for a photographer: the work leads, and inquiring takes one tap.",
      services: [
        { name: "Portraits", blurb: "Individuals and families." },
        { name: "Events", blurb: "Celebrations and gatherings." },
        { name: "Headshots", blurb: "Clean and professional." },
        { name: "Product photos", blurb: "For your shop or brand." },
      ],
      highlights: ["Your best work up front", "Inquire in one tap", "Fast on any phone"],
      ctaLabel: "Book a session",
      ctaKind: "book",
      hours: "By appointment",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#f2f2f2", bg: "#0a0a0a", surface: "#161616", text: "#f5f5f5", muted: "#8f8f8f", heading: "serif", radius: "2px" },
    },
  },
  {
    slug: "personal-trainers",
    name: "Personal trainers",
    singular: "personal trainer",
    templateKey: "FITNESS_TEMPLATE",
    headline: "Turn followers into paying clients.",
    intro: "People follow you for motivation but need a clear next step to train with you. Give them one.",
    problem: "Trainers build an audience and then lose it because there's no obvious place to learn about programs or book a first session.",
    features: [
      "Your programs and training styles explained clearly",
      "A book-a-session button that goes to your calendar",
      "Your story and approach, in your own words",
      "Links to your social profiles",
    ],
    faqs: [
      { q: "Can it link to my calendar?", a: "Yes. Send your booking link and the button goes straight to it." },
      { q: "Can it show my programs?", a: "Yes. We'll lay out each program and who it's for." },
      { q: "Will you add client results?", a: "Only real results you give us permission to share. We never invent them." },
    ],
    sample: {
      businessName: "Sample Fitness Coaching",
      tagline: "Train with a plan.",
      about: "An energetic one-page site for a trainer: your programs, your approach, and one clear way to book a first session.",
      services: [
        { name: "1-on-1 training", blurb: "A plan built around you." },
        { name: "Small groups", blurb: "Train with a partner." },
        { name: "Online coaching", blurb: "Train from anywhere." },
        { name: "Nutrition guidance", blurb: "Habits that stick." },
      ],
      highlights: ["Book a first session fast", "Programs explained clearly", "Your story, your voice"],
      ctaLabel: "Book a session",
      ctaKind: "book",
      hours: "Mon to Sat, 6 am to 8 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#ff5a1f", bg: "#111318", surface: "#1a1d25", text: "#f5f6f8", muted: "#9aa1af", heading: "sans", radius: "12px" },
    },
  },
  {
    slug: "cleaning-companies",
    name: "Cleaning companies",
    singular: "cleaning company",
    templateKey: "SERVICE_BUSINESS_TEMPLATE",
    headline: "Make trust easy for people letting you into their space.",
    intro: "Customers choose a cleaner they feel comfortable with. A clear, friendly page makes that decision easy.",
    problem: "Cleaning is a trust purchase. Without a professional page, customers can't see what's included or how to book, so they choose whoever explains it best.",
    features: [
      "Your services and what's included, laid out simply",
      "Residential and commercial options explained",
      "A request-a-quote button and tap-to-call",
      "Your service area and hours",
    ],
    faqs: [
      { q: "Can I list what each cleaning includes?", a: "Yes. We'll lay out each service and what it covers so customers know what to expect." },
      { q: "Can I serve homes and offices?", a: "Yes. We'll explain both clearly." },
      { q: "Can customers request a quote?", a: "Yes. The button can call, text, or open a form, whichever you prefer." },
    ],
    sample: {
      businessName: "Sample Cleaning Co.",
      tagline: "A cleaner space, without the hassle.",
      about: "A bright, friendly one-page site for a cleaning company: what's included, who you serve, and a simple way to get a quote.",
      services: [
        { name: "Home cleaning", blurb: "Regular or one-time." },
        { name: "Deep cleaning", blurb: "The thorough reset." },
        { name: "Move in and out", blurb: "Ready for the next chapter." },
        { name: "Office cleaning", blurb: "Keep the workplace fresh." },
      ],
      highlights: ["Get a quote in one tap", "What's included, spelled out", "Service area at a glance"],
      ctaLabel: "Get a quote",
      ctaKind: "quote",
      hours: "Mon to Sat, 8 am to 6 pm",
      address: "Serving your local area",
      phone: PHONE,
      tokens: { accent: "#2aa7a1", bg: "#f2fbfa", surface: "#ffffff", text: "#12302e", muted: "#54716f", heading: "sans", radius: "16px" },
    },
  },
  {
    slug: "local-retail",
    name: "Local retail shops",
    singular: "local retail shop",
    templateKey: "RETAIL_TEMPLATE",
    headline: "Bring your shop's personality online, and get people through the door.",
    intro: "Shoppers check hours and what you carry before they visit. Answer both before they think of a bigger store.",
    problem: "Small shops get overlooked because people can't find hours, what's in stock, or where to park. A simple page gets them through the door.",
    features: [
      "What you carry, shown in clear categories",
      "Hours, address, and directions",
      "Tap-to-call and links to your social pages",
      "A section for events, sales, or new arrivals",
    ],
    faqs: [
      { q: "Can I sell online with the one-page website?", a: "Our one-page website is informational. Full online stores are a bigger build we can scope separately." },
      { q: "Can I show what I carry?", a: "Yes. We'll organize your products or categories with photos you provide." },
      { q: "Can it show my hours?", a: "Yes, front and center, with directions." },
    ],
    sample: {
      businessName: "Sample Shop",
      tagline: "Local goods, worth the trip.",
      about: "A warm one-page site for a local shop: what you carry, when you're open, and how to find you.",
      services: [
        { name: "New arrivals", blurb: "Fresh in the shop." },
        { name: "Gifts", blurb: "Something for everyone." },
        { name: "Home", blurb: "Made to be lived with." },
        { name: "Seasonal", blurb: "What's on for the season." },
      ],
      highlights: ["Hours and directions up front", "See what you carry", "Call or message in one tap"],
      ctaLabel: "Visit the shop",
      ctaKind: "visit",
      hours: "Mon to Sat, 10 am to 6 pm",
      address: ADDRESS,
      phone: PHONE,
      tokens: { accent: "#8a5cc2", bg: "#faf7fd", surface: "#ffffff", text: "#241a33", muted: "#6a5c7d", heading: "serif", radius: "14px" },
    },
  },
];

export function getIndustry(slug: string): IndustryConfig | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
