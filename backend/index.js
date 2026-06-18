const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
const db = require("./db");
const PDFDocument = require("pdfkit");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("SiteAudit AI Backend is running 🚀");
});

/* =========================
   AUDIT ENGINE
========================= */
app.post("/audit", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    let formattedUrl = url;
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const { data: html } = await axios.get(formattedUrl, {
      timeout: 15000,
      headers: { "User-Agent": "SiteAuditAI Bot 1.0" },
    });

    const $ = cheerio.load(html);

    const title = $("title").text() || "";
    const metaDescription =
      $('meta[name="description"]').attr("content") || "";

    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const imgCount = $("img").length;
    const imgMissingAlt = $("img:not([alt])").length;
    const links = $("a").length;

    const textContent = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = textContent.split(" ").length;

    let seoScore = 100;
    let uxScore = 100;
    let performanceScore = 100;
    let mobileScore = 100;

    const issues = [];

    /* =========================
       SEO
    ========================= */
    if (!title) {
      seoScore -= 20;
      issues.push({
        issue: "Missing title tag",
        severity: "critical",
        fix: "Add a title tag (50–60 characters)",
      });
    } else if (title.length < 30) {
      seoScore -= 5;
      issues.push({
        issue: "Title too short",
        severity: "medium",
        fix: "Expand title length",
      });
    }

    if (!metaDescription) {
      seoScore -= 15;
      issues.push({
        issue: "Missing meta description",
        severity: "critical",
        fix: "Add meta description",
      });
    }

    if (h1Count === 0) {
      seoScore -= 15;
      issues.push({
        issue: "Missing H1 tag",
        severity: "critical",
        fix: "Add one H1 tag",
      });
    }

    if (imgMissingAlt > 0) {
      seoScore -= 10;
      issues.push({
        issue: `${imgMissingAlt} images missing alt text`,
        severity: "high",
        fix: "Add alt text to images",
      });
    }

    /* =========================
       UX
    ========================= */
    if (wordCount < 100) {
      uxScore -= 20;
      issues.push({
        issue: "Low content",
        severity: "high",
        fix: "Add more content (300+ words recommended)",
      });
    }

    if (h2Count === 0) {
      uxScore -= 10;
      issues.push({
        issue: "Missing H2 structure",
        severity: "medium",
        fix: "Add H2 headings",
      });
    }

    if (links < 3) {
      uxScore -= 5;
      issues.push({
        issue: "Few internal links",
        severity: "low",
        fix: "Add internal links",
      });
    }

    /* =========================
       PERFORMANCE + MOBILE
    ========================= */
    if (imgCount > 15) {
      performanceScore -= 15;
      mobileScore -= 10;
    } else if (imgCount > 10) {
      performanceScore -= 10;
    }

    if (wordCount < 100) {
      mobileScore -= 5;
    }

    seoScore = Math.max(0, seoScore);
    uxScore = Math.max(0, uxScore);
    performanceScore = Math.max(0, performanceScore);
    mobileScore = Math.max(0, mobileScore);

    const overallScore = Math.round(
      (seoScore + uxScore + performanceScore + mobileScore) / 4
    );

    const analysis = {
      title,
      metaDescription,
      h1Count,
      h2Count,
      imgCount,
      imgMissingAlt,
      links,
      wordCount,
    };

    const sortedIssues = issues.sort((a, b) => {
      const order = { critical: 3, high: 2, medium: 1, low: 0 };
      return order[b.severity] - order[a.severity];
    });

    /* =========================
       DB INSERT (better-sqlite3 FIXED)
    ========================= */
    const insert = db.prepare(`
      INSERT INTO audits (
        url,
        seoScore,
        uxScore,
        performanceScore,
        mobileScore,
        overallScore,
        analysis,
        issues
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      url,
      seoScore,
      uxScore,
      performanceScore,
      mobileScore,
      overallScore,
      JSON.stringify(analysis),
      JSON.stringify(sortedIssues)
    );

    res.json({
      url,
      seoScore,
      uxScore,
      performanceScore,
      mobileScore,
      overallScore,
      analysis,
      issues: sortedIssues,
    });
  } catch (error) {
    console.error("AUDIT ERROR:", error.message);

    res.status(500).json({
      error: "Failed to analyze website",
      details: error.message,
    });
  }
});

/* =========================
   GET ALL AUDITS (FIXED)
========================= */
app.get("/audits", (req, res) => {
  try {
    const stmt = db.prepare(
      `SELECT * FROM audits ORDER BY id DESC LIMIT 20`
    );
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SINGLE AUDIT (FIXED)
========================= */
app.get("/audits/:id", (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM audits WHERE id = ?`);
    const row = stmt.get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: "Audit not found" });
    }

    row.analysis = JSON.parse(row.analysis || "{}");
    row.issues = JSON.parse(row.issues || "[]" );

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PDF EXPORT
========================= */
app.get("/audits/:id/pdf", (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM audits WHERE id = ?`);
    const row = stmt.get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: "Audit not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audit-${row.id}.pdf`
    );

    doc.pipe(res);

    const analysis = JSON.parse(row.analysis || "{}");
    const issues = JSON.parse(row.issues || "[]");

    doc.fontSize(20).text("SiteAudit AI Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Website: ${row.url}`);
    doc.text(`Overall Score: ${row.overallScore}`);
    doc.moveDown();

    doc.text(`SEO: ${row.seoScore}`);
    doc.text(`UX: ${row.uxScore}`);
    doc.text(`Performance: ${row.performanceScore}`);
    doc.text(`Mobile: ${row.mobileScore}`);
    doc.moveDown();

    doc.text("Analysis:");
    Object.entries(analysis).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`);
    });

    doc.moveDown();
    doc.text("Issues:");

    issues.forEach((issue, i) => {
      doc.text(`${i + 1}. ${issue.issue} (${issue.severity})`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});