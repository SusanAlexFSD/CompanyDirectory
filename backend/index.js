console.log("Backend loaded from:", process.cwd());

import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());


// -------------------- DATABASE --------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// -------------------- TEST ROUTES --------------------

app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

app.get("/api/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0] });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- PERSONNEL --------------------

// GET ALL PERSONNEL
app.get("/api/personnel", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.firstname AS "firstName",
        p.lastname AS "lastName",
        p.email,
        d.id AS "departmentID",
        d.name AS "departmentName",
        l.name AS "locationName"
      FROM personnel p
      LEFT JOIN department d ON p.departmentid = d.id
      LEFT JOIN location l ON d.locationid = l.id
      ORDER BY p.lastname, p.firstname
    `);

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows
    });
  } catch (err) {
    console.error("Get personnel error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET ONE PERSON
app.get("/api/personnel/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        firstname AS "firstName",
        lastname AS "lastName",
        email,
        departmentid AS "departmentID"
      FROM personnel
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Get person error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ADD PERSON
app.post("/api/personnel", async (req, res) => {
  try {
    const { firstName, lastName, email, departmentID } = req.body;

    await pool.query(
      `
      INSERT INTO personnel (firstname, lastname, email, departmentid)
      VALUES ($1, $2, $3, $4)
      `,
      [firstName, lastName, email, departmentID]
    );

    res.json({ status: { code: 200, name: "ok" } });
  } catch (err) {
    console.error("Insert person error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE PERSON
app.put("/api/personnel/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, departmentID } = req.body;

    await pool.query(
      `
      UPDATE personnel
      SET firstname = $1,
          lastname = $2,
          email = $3,
          departmentid = $4
      WHERE id = $5
      `,
      [firstName, lastName, email, departmentID, req.params.id]
    );

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE PERSON
app.delete("/api/personnel/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM personnel WHERE id = $1", [req.params.id]);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- DEPARTMENTS --------------------

app.get("/api/departments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        l.name AS "locationName"
      FROM department d
      LEFT JOIN location l ON d.locationid = l.id
      ORDER BY d.name
    `);

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows
    });
  } catch (err) {
    console.error("Get departments error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/departments/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM department WHERE id = $1", [req.params.id]);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Delete department error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- LOCATIONS --------------------

app.get("/api/locations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM location
      ORDER BY name
    `);

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows
    });
  } catch (err) {
    console.error("Get locations error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


console.log("About to start server…");
// -------------------- START SERVER --------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("SERVER LISTEN CALLBACK FIRED");
  console.log(`API running on port ${PORT}`);
});
setInterval(() => {}, 1000);