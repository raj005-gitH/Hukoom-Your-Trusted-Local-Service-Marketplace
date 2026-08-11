const express = require("express");
const router = express.Router();
const ServiceQuery = require("../models/ServiceQuery");
const Hero = require("../models/Hero");

// Predefined areas for supported cities
const CITY_AREAS = {
  noida: [
    "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
    "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10",
    "Sector 11", "Sector 12", "Sector 14", "Sector 15", "Sector 15A",
    "Sector 16", "Sector 16A", "Sector 17", "Sector 18", "Sector 19",
    "Sector 20", "Sector 21", "Sector 22", "Sector 25", "Sector 26",
    "Sector 27", "Sector 29", "Sector 30", "Sector 31", "Sector 32",
    "Sector 33", "Sector 34", "Sector 35", "Sector 36", "Sector 37",
    "Sector 39", "Sector 40", "Sector 41", "Sector 44", "Sector 45",
    "Sector 46", "Sector 47", "Sector 48", "Sector 49", "Sector 50",
    "Sector 51", "Sector 52", "Sector 53", "Sector 54", "Sector 55",
    "Sector 56", "Sector 57", "Sector 58", "Sector 59", "Sector 60",
    "Sector 61", "Sector 62", "Sector 63", "Sector 63A",
    "Sector 71", "Sector 72", "Sector 73", "Sector 74", "Sector 75",
    "Sector 76", "Sector 77", "Sector 78", "Sector 79",
    "Sector 82", "Sector 83", "Sector 84", "Sector 85",
    "Sector 92", "Sector 93", "Sector 93A", "Sector 93B",
    "Sector 94", "Sector 95", "Sector 96", "Sector 97", "Sector 98",
    "Sector 99", "Sector 100", "Sector 104", "Sector 107",
    "Sector 108", "Sector 110", "Sector 115", "Sector 116",
    "Sector 117", "Sector 118", "Sector 119", "Sector 120",
    "Sector 121", "Sector 122", "Sector 125", "Sector 126",
    "Sector 127", "Sector 128", "Sector 129", "Sector 130",
    "Sector 131", "Sector 132", "Sector 133", "Sector 134",
    "Sector 135", "Sector 136", "Sector 137", "Sector 140",
    "Sector 140A", "Sector 141", "Sector 142", "Sector 143",
    "Sector 143B", "Sector 144", "Sector 145", "Sector 146",
    "Sector 148", "Sector 150", "Sector 151", "Sector 152",
    "Sector 153", "Sector 155", "Sector 156", "Sector 157",
    "Sector 158", "Sector 159", "Sector 160", "Sector 161",
    "Sector 162", "Sector 163", "Sector 164", "Sector 165",
    "Sector 166", "Sector 167", "Sector 168",
    "Alpha 1", "Alpha 2",
    "Beta 1", "Beta 2",
    "Gamma 1", "Gamma 2",
    "Delta 1", "Delta 2", "Delta 3",
    "Phi 1", "Phi 2", "Phi 3", "Phi 4",
    "Chi 1", "Chi 2", "Chi 3", "Chi 4", "Chi 5",
    "Sigma 1", "Sigma 2", "Sigma 3", "Sigma 4",
    "Omicron 1", "Omicron 2", "Omicron 3",
    "Eta 1", "Eta 2",
    "Mu 1", "Mu 2",
    "Zeta 1", "Zeta 2"
  ],
  "greater noida": [    
    "Delta 1", "Delta 2", "Delta 3",    
  ]
};

// Helper: expire stale queries
async function expireStaleQueries() {
  const now = new Date();
  
  // 1. Expire open queries that haven't been picked up
  await ServiceQuery.updateMany(
    { status: "open", expiresAt: { $lt: now } },
    { $set: { status: "expired" } }
  );

  // 2. Auto-complete in-progress queries that reached expiry
  await ServiceQuery.updateMany(
    { status: "in_progress", expiresAt: { $lt: now } },
    { $set: { status: "completed" } }
  );
}

// GET /api/city-areas/:city — Get predefined areas for a city
router.get("/city-areas/:city", (req, res) => {
  const city = req.params.city.toLowerCase().trim();
  const areas = CITY_AREAS[city];
  if (!areas) {
    return res.status(404).json({ message: "City not supported yet", supportedCities: Object.keys(CITY_AREAS) });
  }
  res.json({ city, areas });
});

// GET /api/supported-cities — Get list of supported cities
router.get("/supported-cities", (req, res) => {
  res.json({ cities: Object.keys(CITY_AREAS).map(c => c.charAt(0).toUpperCase() + c.slice(1)) });
});

// POST /api/queries — Create a new service query
router.post("/queries", async (req, res) => {
  try {
    const { userName, userId, city, area, workDescription, price, expiryMinutes } = req.body;

    // Validate required fields
    if (!userName || !userId || !city || !area || !workDescription || !price || !expiryMinutes) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate expiry (15 min to 15 days = 21600 min)
    const minutes = Number(expiryMinutes);
    if (minutes < 15 || minutes > 21600) {
      return res.status(400).json({ message: "Expiry must be between 15 minutes and 15 days" });
    }

    // Validate city
    const cityLower = city.toLowerCase().trim();
    if (!CITY_AREAS[cityLower]) {
      return res.status(400).json({ message: "City not supported", supportedCities: Object.keys(CITY_AREAS) });
    }

    // Validate area
    if (!CITY_AREAS[cityLower].includes(area)) {
      return res.status(400).json({ message: "Area not found in this city" });
    }

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const query = new ServiceQuery({
      userName,
      userId,
      city: cityLower,
      area,
      workDescription,
      price: Number(price),
      expiresAt,
    });

    await query.save();

    res.status(201).json({ message: "Query posted successfully", query });
  } catch (error) {
    console.log("Error creating query:", error);
    res.status(500).json({ message: "Error creating query", error: error.message });
  }
});

// GET /api/queries/areas/:city — Get areas with active query counts for a city (hero view)
router.get("/queries/areas/:city", async (req, res) => {
  try {
    await expireStaleQueries();

    const city = req.params.city.toLowerCase().trim();
    if (!CITY_AREAS[city]) {
      return res.status(404).json({ message: "City not supported" });
    }

    const areaCounts = await ServiceQuery.aggregate([
      { $match: { city, status: { $in: ["open", "in_progress"] } } },
      { $group: { _id: "$area", count: { $sum: 1 }, openCount: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ city, areas: areaCounts });
  } catch (error) {
    console.log("Error fetching areas:", error);
    res.status(500).json({ message: "Error fetching areas", error: error.message });
  }
});

// GET /api/queries/user/:userId — Get all queries posted by a specific user
router.get("/queries/user/:userId", async (req, res) => {
  try {
    await expireStaleQueries();

    const queries = await ServiceQuery.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ queries });
  } catch (error) {
    console.log("Error fetching user queries:", error);
    res.status(500).json({ message: "Error fetching user queries", error: error.message });
  }
});

// GET /api/queries/hero/:heroId — Get all queries accepted by a specific hero
router.get("/queries/hero/:heroId", async (req, res) => {
  try {
    await expireStaleQueries();

    const queries = await ServiceQuery.find({ heroId: req.params.heroId }).sort({ createdAt: -1 });
    res.json({ queries });
  } catch (error) {
    console.log("Error fetching hero queries:", error);
    res.status(500).json({ message: "Error fetching hero queries", error: error.message });
  }
});

// GET /api/queries/:city/:area — Get all active queries for an area (hero chatroom view)
// NOTE: This wildcard route MUST come AFTER all specific /queries/... routes
router.get("/queries/:city/:area", async (req, res) => {
  try {
    await expireStaleQueries();

    const city = req.params.city.toLowerCase().trim();
    const area = decodeURIComponent(req.params.area).trim();

    const queries = await ServiceQuery.find({
      city,
      area,
      status: { $in: ["open", "in_progress"] }
    }).sort({ createdAt: -1 });

    res.json({ city, area, queries });
  } catch (error) {
    console.log("Error fetching queries:", error);
    res.status(500).json({ message: "Error fetching queries", error: error.message });
  }
});

// PATCH /api/queries/:id/accept — Hero accepts a query
router.patch("/queries/:id/accept", async (req, res) => {
  try {
    const { heroId, heroName } = req.body;

    if (!heroId || !heroName) {
      return res.status(400).json({ message: "heroId and heroName are required" });
    }

    const query = await ServiceQuery.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }

    // Check if already expired
    if (query.expiresAt < new Date()) {
      query.status = "expired";
      await query.save();
      return res.status(400).json({ message: "This query has expired" });
    }

    if (query.status !== "open") {
      return res.status(400).json({ message: `Query is already ${query.status}` });
    }

    // Check if hero is barred (3 cancellations in last 24h)
    const hero = await Hero.findById(heroId);
    if (!hero) return res.status(404).json({ message: "Hero not found" });

    if (hero.barredUntil && hero.barredUntil > new Date()) {
      const waitTime = Math.ceil((hero.barredUntil - new Date()) / (1000 * 60 * 60));
      return res.status(403).json({ 
        message: `You are temporarily barred from accepting new work due to frequent cancellations. Please try again in ${waitTime} hour(s).` 
      });
    }

    query.status = "in_progress";
    query.heroId = heroId;
    query.heroName = heroName;
    await query.save();

    res.json({ message: "Query accepted successfully", query });
  } catch (error) {
    console.log("Error accepting query:", error);
    res.status(500).json({ message: "Error accepting query", error: error.message });
  }
});

// PATCH /api/queries/:id/complete — User marks query as completed
router.patch("/queries/:id/complete", async (req, res) => {
  try {
    const { userId } = req.body;
    const query = await ServiceQuery.findById(req.params.id);

    if (!query) return res.status(404).json({ message: "Query not found" });
    if (query.userId.toString() !== userId) {
      return res.status(403).json({ message: "Only the user who posted this query can mark it as completed" });
    }
    if (query.status !== "in_progress") {
      return res.status(400).json({ message: `Cannot complete a query that is ${query.status}` });
    }

    query.status = "completed";
    await query.save();
    res.json({ message: "Work marked as completed successfully", query });
  } catch (error) {
    res.status(500).json({ message: "Error completing query", error: error.message });
  }
});

// PATCH /api/queries/:id/cancel — Hero cancels accepted work
router.patch("/queries/:id/cancel", async (req, res) => {
  try {
    const { heroId } = req.body;
    const query = await ServiceQuery.findById(req.params.id);

    if (!query) return res.status(404).json({ message: "Query not found" });
    if (!query.heroId || query.heroId.toString() !== heroId) {
      return res.status(403).json({ message: "Only the hero who accepted this work can cancel it" });
    }
    if (query.status !== "in_progress") {
      return res.status(400).json({ message: "Only in-progress work can be cancelled" });
    }

    // Update Query: move back to open
    query.status = "open";
    query.heroId = null;
    query.heroName = null;
    await query.save();

    // Update Hero: record cancellation and check limit
    const hero = await Hero.findById(heroId);
    if (hero) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Filter previous cancellations within last 24h
      hero.cancellations = hero.cancellations.filter(date => date > twentyFourHoursAgo);
      hero.cancellations.push(now);

      if (hero.cancellations.length >= 3) {
        hero.barredUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
      await hero.save();
    }

    res.json({ 
      message: "Work cancelled successfully. The query is now open for other heroes.",
      cancellationsCount: hero ? hero.cancellations.length : 0 
    });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling query", error: error.message });
  }
});

module.exports = router;
