import type { InvestmentSector } from "@istiqtab/core";

export type SectorGuide = {
  sector: InvestmentSector;
  /** Short tagline for hub cards */
  tagline: string;
  /** Full overview paragraph shown on the sector page */
  overview: string;
  /** Key FDI/market data points */
  stats: { label: string; value: string }[];
  /** Top locations for this sector */
  topRegions: string[];
  /** Key international companies already present */
  keyPlayers: string[];
  /** Typical applicable incentives (from Charter 2022) */
  incentiveHighlights: string[];
  /** Special setup notes for this sector */
  setupNotes: string[];
  /** Relevant regulatory bodies */
  regulatoryBodies: { name: string; role: string }[];
};

export const SECTOR_GUIDES: Record<string, SectorGuide> = {
  automotive: {
    sector: "automotive",
    tagline: "Morocco's largest export sector — Tanger and Kenitra anchor two world-class clusters.",
    overview:
      "Morocco's automotive industry is the country's #1 export sector, generating over MAD 80 billion annually. Anchored by Renault in Tangier (400,000 units/year) and Stellantis/PSA in Kenitra (200,000 units/year), the ecosystem hosts 250+ tier-1/tier-2 suppliers. Morocco targets 1 million vehicles/year by 2030 under the Automotive Industry Strategy. The proximity to European OEMs (3 hours from Spain), competitive labour costs, and a deep free-zone infrastructure make it the leading nearshoring destination for EV and ICE manufacturing alike.",
    stats: [
      { label: "Annual exports", value: "MAD 80B+" },
      { label: "OEM capacity", value: "700,000 vehicles/year" },
      { label: "Suppliers established", value: "250+" },
      { label: "Jobs in sector", value: "220,000+" },
    ],
    topRegions: ["Tanger-Tétouan-Al Hoceïma", "Rabat-Salé-Kénitra", "Casablanca-Settat"],
    keyPlayers: ["Renault Group", "Stellantis/PSA", "Yazaki", "Sumitomo Electric", "Lear Corporation", "Delphi Technologies"],
    incentiveHighlights: [
      "5-year IS exemption for new manufacturing companies",
      "VAT exemption on imported production equipment",
      "Customs duty exemption on capital goods",
      "Land subsidy (prime foncière) on industrial zones",
      "SEZ benefits in Tanger Free Zone & Atlantic Free Zone (Kenitra)",
    ],
    setupNotes: [
      "SARL or SA recommended for majority-foreign-owned manufacturers",
      "OEM supply agreements often require IATF 16949 quality certification",
      "ANAPEC labour validation required before hiring local staff",
      "Tanger Med and Port of Kenitra offer direct RoRo shipping to Europe",
    ],
    regulatoryBodies: [
      { name: "AMICA", role: "Moroccan Automotive Industry Association — sector gateway" },
      { name: "ANAPEC", role: "Validates labour contracts for sector workers" },
      { name: "CRI Tanger-Tétouan", role: "Primary CRI for Tanger Med cluster" },
      { name: "CRI Rabat-Salé-Kénitra", role: "Primary CRI for Kenitra cluster" },
    ],
  },
  renewables: {
    sector: "renewables",
    tagline: "52% renewable target by 2030 — Africa's leading green energy investment destination.",
    overview:
      "Morocco is Africa's leading renewable energy market, with a target of 52% renewable electricity capacity by 2030. The country hosts Noor Ouarzazate (the world's largest CSP plant), Tarfaya (Morocco's largest wind farm at 300 MW), and is scaling offshore wind and green hydrogen. The government's Green Hydrogen Roadmap, signed in 2021, targets 3–4 GW electrolyser capacity by 2030, attracting major European industrial buyers. Morocco's geography — abundant sun, Atlantic wind corridor, and proximity to EU markets — makes it a prime location for renewable manufacturing, green hydrogen production, and clean energy investment.",
    stats: [
      { label: "Installed RE capacity", value: "4.5 GW" },
      { label: "2030 RE target", value: "52% of total capacity" },
      { label: "Solar irradiation", value: "2,600+ kWh/m²/year" },
      { label: "Green H₂ pipeline", value: "3–4 GW by 2030" },
    ],
    topRegions: ["Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab", "Oriental"],
    keyPlayers: ["MASEN (state agency)", "NAREVA", "Enel Green Power", "Total Energies", "Siemens Gamesa", "Acwa Power"],
    incentiveHighlights: [
      "Priority grid access for renewable projects (Law 13-09)",
      "IS exemption for renewable energy producers",
      "Customs and VAT exemption on renewable energy equipment",
      "Special incentives for green hydrogen projects under 2021 Roadmap",
      "Land grants in dedicated renewable energy zones",
    ],
    setupNotes: [
      "MASEN coordinates large-scale renewable tenders — engagement early in process is critical",
      "SA structure typically required for projects with multiple institutional investors",
      "ANRE (National Electricity Regulator) approval required for grid-connected projects",
      "Export-oriented green H₂ projects may qualify for EU hydrogen partnerships",
    ],
    regulatoryBodies: [
      { name: "MASEN", role: "Moroccan Agency for Sustainable Energy — tender authority" },
      { name: "ANRE", role: "National Electricity Regulator" },
      { name: "ONEE", role: "National electricity utility — grid operator" },
      { name: "Ministry of Energy Transition", role: "Green hydrogen & policy framework" },
    ],
  },
  bpo_ites: {
    sector: "bpo_ites",
    tagline: "2nd-largest BPO destination in Africa — francophone nearshoring hub for Europe.",
    overview:
      "Morocco is the #2 BPO/offshoring destination in Africa (after South Africa) and the leading francophone nearshoring hub for France and Belgium. The sector generates €1.2 billion in annual exports and employs 120,000+ agents across Casablanca, Rabat, Marrakech, and Fès. Morocco's proximity to Europe (same time zone as UK/Portugal, 1 hour behind France), large French/English bilingual workforce, OFPPT-trained talent pipeline, and competitive labour costs (25–40% below French equivalent) make it the top nearshoring choice for contact centres, IT services, and back-office operations.",
    stats: [
      { label: "Annual exports", value: "€1.2B+" },
      { label: "Agents employed", value: "120,000+" },
      { label: "Labour cost advantage", value: "25–40% vs. France" },
      { label: "French speakers", value: "13M+ literate" },
    ],
    topRegions: ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès"],
    keyPlayers: ["Teleperformance", "Webhelp/Concentrix", "Intelcia", "Outsourcia", "Majorel", "Capgemini"],
    incentiveHighlights: [
      "IS exemption on export revenue (5-year, extendable for strategic operators)",
      "OFPPT training subsidies for new hires",
      "Employment premium per stable job created",
      "Casablanca Finance City (CFC) status for qualifying service companies",
      "Cyber Park Rabat and Casa Nearshore Park — subsidised tech campuses",
    ],
    setupNotes: [
      "SA or SARL both viable; SA preferred for large centres with external shareholders",
      "CNSS registration and ANAPEC filing required before hiring",
      "CFC status (for Casablanca) provides additional tax and regulatory advantages",
      "Data protection: CNDP approval required for processing EU personal data",
    ],
    regulatoryBodies: [
      { name: "AMDIE", role: "National investment agency — offshore operators" },
      { name: "CFC (Casablanca Finance City)", role: "Special status for eligible service companies" },
      { name: "CNDP", role: "Data protection authority — mandatory for EU data flows" },
      { name: "OFPPT", role: "Vocational training agency — BPO talent pipeline" },
    ],
  },
  agrifood: {
    sector: "agrifood",
    tagline: "Africa's food export powerhouse — Plan Maroc Vert drives agri-food FDI.",
    overview:
      "Morocco is the world's largest phosphate exporter and a top-10 global agricultural exporter. The Plan Maroc Vert (2008–2020) and its successor Génération Green 2020–2030 have modernised the sector, boosting agri-food exports to MAD 47 billion in 2023. Key sub-sectors attracting FDI include olive oil, citrus & vegetables (fresh and processed), seafood processing, aromatic plants, and processed food manufacturing for European export. The Souss-Massa region (Agadir hub) is the primary cluster for fresh produce export, while Fès-Meknès anchors grain and dairy processing.",
    stats: [
      { label: "Agri-food exports (2023)", value: "MAD 47B" },
      { label: "Phosphate market share", value: "#1 globally" },
      { label: "Arable land", value: "8.7M hectares" },
      { label: "Fisheries output", value: "1.4M tonnes/year" },
    ],
    topRegions: ["Souss-Massa", "Marrakech-Safi", "Fès-Meknès", "Dakhla-Oued Ed-Dahab"],
    keyPlayers: ["OCP Group (phosphates)", "Cosumar (sugar)", "Lesieur Cristal (oils)", "Agrolait", "Fresh Del Monte", "Cargill"],
    incentiveHighlights: [
      "Tax exemptions on agricultural income (IS)",
      "VAT exemption on agricultural equipment",
      "Subsidy on irrigation equipment (Plan Maroc Vert)",
      "Export support via EACCE (agricultural export centre)",
      "OFPPT training subsidies for food-processing workers",
    ],
    setupNotes: [
      "ONSSA (National Food Safety Office) approval required for food processing",
      "Halal certification increasingly required for Gulf/Asian export markets",
      "Water permit from ABHSM required for irrigation-intensive operations",
      "Agadir Special Economic Zone offers logistics advantages for fresh exports",
    ],
    regulatoryBodies: [
      { name: "ONSSA", role: "Food safety authority — mandatory for processing/export" },
      { name: "EACCE", role: "Agricultural export promotion centre" },
      { name: "MAPMDREF", role: "Ministry of Agriculture — sector policy and incentives" },
      { name: "ABHSM", role: "Water basin agency — irrigation permits" },
    ],
  },
  tourism: {
    sector: "tourism",
    tagline: "13M visitors/year — Vision 2030 targets 26M tourists and €12B in receipts.",
    overview:
      "Morocco received 14.5 million tourists in 2023 (+34% vs. 2022), recovering to pre-COVID levels. The government's Tourism Vision 2030 targets 26 million tourists and MAD 120 billion (€12B) in receipts. Key FDI areas include hotel development (4-5 star and boutique luxury), eco-tourism and desert lodges, wellness and spa resorts, and tourism real estate (residence permit programme). Marrakech, Agadir, and the Atlantic coast anchor beach and city tourism; Fès and Meknes attract cultural heritage tourism; Zagora and Ouarzazate drive desert and adventure tourism.",
    stats: [
      { label: "Tourists (2023)", value: "14.5M" },
      { label: "Tourism receipts", value: "MAD 105B (2023)" },
      { label: "2030 target", value: "26M tourists" },
      { label: "Hotel capacity", value: "280,000+ beds" },
    ],
    topRegions: ["Marrakech-Safi", "Souss-Massa", "Fès-Meknès", "Drâa-Tafilalet"],
    keyPlayers: ["Accor Hotels", "Marriott / Sheraton", "Club Med", "Thomas Cook", "Riu Hotels", "Onomo Hotels"],
    incentiveHighlights: [
      "IS exemption for new hotel construction projects",
      "TVA exemption on construction materials for hotels",
      "Land subsidy for tourism development in priority zones",
      "SMIT (Moroccan Tourism Investment Society) co-investment programs",
      "Employment premium for permanent hotel staff",
    ],
    setupNotes: [
      "Hotel classification licence from Ministry of Tourism required",
      "SA structure recommended for hotel companies with international investors",
      "ONSSA certification required for hotel food service operations",
      "Environmental impact assessment required for coastal/protected zone developments",
    ],
    regulatoryBodies: [
      { name: "Ministry of Tourism", role: "Hotel classification and licensing" },
      { name: "SMIT", role: "Tourism investment co-financing and facilitation" },
      { name: "ONMT", role: "National tourism marketing office" },
      { name: "ONSSA", role: "Food safety authority for hotel F&B" },
    ],
  },
  pharma: {
    sector: "pharma",
    tagline: "MAD 16B market — Africa's 2nd pharmaceutical hub after South Africa.",
    overview:
      "Morocco is Africa's 2nd-largest pharmaceutical market (after South Africa), with domestic production covering ~55% of local consumption. The sector generated MAD 16 billion in 2023 and is growing at 8% annually. Morocco hosts 50+ pharmaceutical manufacturers — led by Sanofi, Pfizer, and Novartis subsidiaries alongside local champions like Pharma 5, Cooper Pharma, and Galenica. The government's Pharma 2025 strategy aims to double local production capacity, with specific incentives for API manufacturing, generics production, and biotech. The country is increasingly used as a platform for distribution to sub-Saharan Africa.",
    stats: [
      { label: "Market size (2023)", value: "MAD 16B" },
      { label: "Annual growth", value: "8%" },
      { label: "Local production", value: "55% of consumption" },
      { label: "Manufacturers", value: "50+" },
    ],
    topRegions: ["Casablanca-Settat", "Rabat-Salé-Kénitra"],
    keyPlayers: ["Sanofi Morocco", "Pfizer Morocco", "Pharma 5", "Cooper Pharma", "Galenica", "Maphar"],
    incentiveHighlights: [
      "IS exemption for new pharmaceutical manufacturing investments",
      "VAT exemption on pharmaceutical production equipment",
      "R&D credit for pharma R&D activities",
      "Priority support under Pharma 2025 strategy",
      "Customs exemption on API imports",
    ],
    setupNotes: [
      "Ministry of Health (DMP) authorisation required before production",
      "GMP certification (WHO or EU standard) required for export",
      "ONSSA certification for food-grade pharmaceuticals",
      "Foreign ownership up to 100% permitted in manufacturing",
    ],
    regulatoryBodies: [
      { name: "DMP", role: "Directorate of Medicines — manufacturing licences" },
      { name: "AMDM", role: "Moroccan Agency for Medicines — market authorisation" },
      { name: "MICIEN", role: "Ministry of Industry — investment facilitation" },
    ],
  },
  finance: {
    sector: "finance",
    tagline: "Casablanca Finance City — Africa's top financial hub ranked by GFCI.",
    overview:
      "Casablanca is Africa's leading international financial centre, home to 200+ multinationals using Morocco as their African HQ. Casablanca Finance City (CFC) provides a special regulatory framework for banks, insurers, asset managers, and corporate holding companies. Morocco's financial sector is the most sophisticated in North Africa, with a banking penetration rate of 80%+ and 19 banks including Attijariwafa Bank, BCP, and BMCE, all with pan-African networks. Islamic finance (participative banking) is rapidly growing following the 2017 law. The CFC status confers a flat 15% IS rate, simplified accounting, and work permit facilitation for expatriate staff.",
    stats: [
      { label: "CFC member companies", value: "200+" },
      { label: "Banking penetration", value: "80%+" },
      { label: "CFC IS rate", value: "15% flat" },
      { label: "GFCI ranking (Africa)", value: "#1" },
    ],
    topRegions: ["Casablanca-Settat"],
    keyPlayers: ["Attijariwafa Bank", "BCP", "BMCE Bank (Bank of Africa)", "Société Générale Maroc", "CIH Bank", "BMCI (BNP Paribas)"],
    incentiveHighlights: [
      "CFC status: flat 15% IS for eligible financial service companies",
      "5-year IS exemption for new CFC-registered entities",
      "Simplified work permits for CFC expatriate staff",
      "Free profit repatriation for non-resident investors",
      "VAT exemption on qualifying CFC services",
    ],
    setupNotes: [
      "SA is the standard structure for financial institutions",
      "Bank Al-Maghrib (BAM) authorisation required for banking and payment activities",
      "ACAPS supervision required for insurance operations",
      "AMMC licensing required for capital markets activities",
      "CFC status application submitted to Casablanca Finance City authority",
    ],
    regulatoryBodies: [
      { name: "Bank Al-Maghrib", role: "Central bank — banking and payment regulation" },
      { name: "ACAPS", role: "Supervisory authority for insurance and pension funds" },
      { name: "AMMC", role: "Capital markets authority" },
      { name: "CFC Authority", role: "CFC status applications and compliance" },
    ],
  },
  logistics: {
    sector: "logistics",
    tagline: "Tanger Med — Africa's #1 container port. Morocco is the gateway between Europe and Africa.",
    overview:
      "Morocco's logistics sector generated MAD 45 billion in 2023 and is growing at 9% annually, fuelled by the expansion of Tanger Med (Africa's #1 container port with 9M TEU/year capacity), the National Logistics Strategy 2030, and Morocco's position as a hub between Europe and sub-Saharan Africa. Key FDI opportunities include: logistics platform development, multimodal transport operators, third-party logistics (3PL) services, cold-chain infrastructure (agri-food export), and port-adjacent industrial parks. The Tanger Med Special Zone offers the most advanced logistics infrastructure in Africa.",
    stats: [
      { label: "Tanger Med capacity", value: "9M TEU/year" },
      { label: "Sector revenue (2023)", value: "MAD 45B" },
      { label: "Annual growth", value: "9%" },
      { label: "Logistics zones", value: "20+ dedicated zones" },
    ],
    topRegions: ["Tanger-Tétouan-Al Hoceïma", "Casablanca-Settat", "Oriental", "Souss-Massa"],
    keyPlayers: ["Marsa Maroc", "APM Terminals (Tanger Med)", "BMCE Logistics", "CMA CGM", "DB Schenker", "Kuehne+Nagel"],
    incentiveHighlights: [
      "SEZ benefits in Tanger Med Special Zone",
      "IS and customs exemptions for logistics platform operators",
      "VAT exemption on logistics equipment",
      "Employment premium for logistics workforce",
      "Export support for logistics operators serving pan-African routes",
    ],
    setupNotes: [
      "Customs agent licence (ADII) required for customs brokerage",
      "OMPIC registration required for transport companies",
      "Cold-chain operators: ONSSA certification required",
      "Tanger Med zone access requires TMSA (Tanger Med Special Agency) agreement",
    ],
    regulatoryBodies: [
      { name: "AMDL", role: "Moroccan Logistics Development Agency" },
      { name: "TMSA", role: "Tanger Med Special Agency — zone access and operations" },
      { name: "ADII", role: "Customs authority — import/export licensing" },
      { name: "ONCF", role: "National railway — freight and logistics corridors" },
    ],
  },
  tech: {
    sector: "tech",
    tagline: "Digital Morocco 2030 — growing tech ecosystem with 30,000+ IT graduates/year.",
    overview:
      "Morocco's technology sector is growing rapidly, driven by Digital Morocco 2030 (a national digital transformation strategy), a young and growing IT talent pool (30,000+ engineering graduates annually), competitive operational costs, and the country's dual position as a nearshoring hub for Europe and a gateway to African digital markets. Key FDI areas include software development centres, IT infrastructure and cloud services, fintech, edtech, and digital payment platforms. Casablanca's CFC and Rabat's Technopark are the primary tech clusters; Casablanca also hosts Technopark Casablanca and the Cyber Park Rabat.",
    stats: [
      { label: "IT graduates/year", value: "30,000+" },
      { label: "Digital exports", value: "MAD 8B+ (2023)" },
      { label: "Tech startups", value: "500+" },
      { label: "Internet penetration", value: "92%" },
    ],
    topRegions: ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Fès-Meknès"],
    keyPlayers: ["Oracle Morocco", "Microsoft Morocco", "IBM Morocco", "Capgemini Morocco", "Axway", "HPS (fintech)"],
    incentiveHighlights: [
      "IS exemption on export-oriented digital services",
      "CFC status for qualifying tech holding companies",
      "Employment premium for IT staff recruited through ANAPEC",
      "R&D credit for tech product development",
      "Technopark subsidised co-working and office space",
    ],
    setupNotes: [
      "SARL or SA both suitable; SARL-AU for solo founders",
      "ANRT (telecoms regulator) licence required for internet service providers",
      "CNDP compliance mandatory for platforms processing personal data",
      "CFC status available for qualifying tech service exporters",
    ],
    regulatoryBodies: [
      { name: "ANRT", role: "National telecoms and digital regulator" },
      { name: "CNDP", role: "Data protection authority" },
      { name: "DGI", role: "Tax authority — IS and digital service tax" },
      { name: "APEBI", role: "Federation of IT and telecoms companies" },
    ],
  },
  aerospace: {
    sector: "aerospace",
    tagline: "MAD 18B aerospace exports — Morocco is Europe's fastest-growing aviation nearshoring hub.",
    overview:
      "Morocco's aerospace sector has grown 15x since 2001, generating MAD 18 billion in exports in 2023 and employing 20,000+ skilled workers. The ecosystem clusters around Casablanca (MRO hub), Rabat-Salé (seat manufacturing), Meknes (structural parts), and the Midparc free zone near Mohammed V International Airport. The sector is anchored by Safran (landing gear), Boeing aerostructures, Thales, Zodiac Aerospace, and EADS/Airbus subsidiaries. Morocco hosts the only aerospace MRO complex in Africa (Aéropole Nouaceur). The GIMAS aerospace cluster and Royal Air Maroc are major ecosystem anchors.",
    stats: [
      { label: "Aerospace exports (2023)", value: "MAD 18B" },
      { label: "Companies established", value: "140+" },
      { label: "Skilled workforce", value: "20,000+" },
      { label: "Annual sector growth", value: "15%" },
    ],
    topRegions: ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Fès-Meknès"],
    keyPlayers: ["Safran", "Boeing", "Thales", "Zodiac Aerospace (Safran Cabin)", "EADS/Airbus Morocco", "Royal Air Maroc Engineering"],
    incentiveHighlights: [
      "5-year IS exemption for aerospace manufacturers",
      "Customs exemption on aerospace-grade imported components",
      "VAT exemption on production equipment",
      "Midparc free zone benefits (logistics + IS advantages)",
      "OFPPT aerospace training programs (IMA — Institut des Métiers de l'Aéronautique)",
    ],
    setupNotes: [
      "DGAC (Civil Aviation Authority) approval required for MRO and certified production",
      "NADCAP certification often required by OEM customers",
      "AS9100 quality standard required for most aerospace supply chain positions",
      "IMA Casablanca provides a trained aerospace technician pipeline",
    ],
    regulatoryBodies: [
      { name: "GIMAS", role: "Moroccan aerospace industry cluster association" },
      { name: "DGAC", role: "Civil aviation authority — MRO and production approval" },
      { name: "ONDA", role: "National airports authority — Midparc zone operator" },
      { name: "IMA", role: "Aerospace training institute — talent pipeline" },
    ],
  },
};

export const GUIDE_SECTORS: InvestmentSector[] = Object.keys(SECTOR_GUIDES) as InvestmentSector[];
