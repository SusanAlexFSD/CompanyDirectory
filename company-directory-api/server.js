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

// -------------------- HELPERS --------------------

function toPositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

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
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

// -------------------- PERSONNEL --------------------

app.get("/api/personnel", async (req, res) => {
  const start = Date.now();

  try {
    const limit = Math.min(toPositiveInt(req.query.limit, 50), 200);
    const page = toPositiveInt(req.query.page, 1);
    const offset = (page - 1) * limit;

    const search = cleanString(req.query.search);
    const departmentID = cleanString(req.query.departmentID);
    const locationID = cleanString(req.query.locationID);

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`
        (
          p.firstname ILIKE $${paramIndex}
          OR p.lastname ILIKE $${paramIndex}
          OR p.email ILIKE $${paramIndex}
          OR d.name ILIKE $${paramIndex}
          OR l.name ILIKE $${paramIndex}
        )
      `);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (departmentID) {
      conditions.push(`d.id = $${paramIndex}`);
      values.push(departmentID);
      paramIndex++;
    }

    if (locationID) {
      conditions.push(`l.id = $${paramIndex}`);
      values.push(locationID);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM personnel p
      LEFT JOIN department d ON p.departmentid = d.id
      LEFT JOIN location l ON d.locationid = l.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        p.id,
        p.firstname AS "firstName",
        p.lastname AS "lastName",
        p.email,
        d.id AS "departmentID",
        d.name AS "departmentName",
        l.id AS "locationID",
        l.name AS "locationName"
      FROM personnel p
      LEFT JOIN department d ON p.departmentid = d.id
      LEFT JOIN location l ON d.locationid = l.id
      ${whereClause}
      ORDER BY p.lastname ASC, p.firstname ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataValues = [...values, limit, offset];
    const result = await pool.query(dataQuery, dataValues);

    console.log(`GET /api/personnel took ${Date.now() - start}ms`);

    res.json({
      status: { code: 200, name: "ok" },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: result.rows
    });
  } catch (err) {
    console.error("Get personnel error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

app.get("/api/personnel/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.firstname AS "firstName",
        p.lastname AS "lastName",
        p.email,
        d.id AS "departmentID",
        d.name AS "departmentName",
        l.id AS "locationID",
        l.name AS "locationName"
      FROM personnel p
      LEFT JOIN department d ON p.departmentid = d.id
      LEFT JOIN location l ON d.locationid = l.id
      WHERE p.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: { code: 404, name: "not found" },
        error: "Person not found"
      });
    }

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Get person error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

app.post("/api/personnel", async (req, res) => {
  try {
    const firstName = cleanString(req.body.firstName);
    const lastName = cleanString(req.body.lastName);
    const email = cleanString(req.body.email);
    const departmentID = req.body.departmentID || null;

    if (!firstName || !lastName || !email || !departmentID) {
      return res.status(400).json({
        status: { code: 400, name: "bad request" },
        error: "firstName, lastName, email and departmentID are required"
      });
    }

    const insertResult = await pool.query(
      `
      INSERT INTO personnel (firstname, lastname, email, departmentid)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [firstName, lastName, email, departmentID]
    );

    res.json({
      status: { code: 200, name: "ok" },
      data: { id: insertResult.rows[0].id }
    });
  } catch (err) {
    console.error("Insert person error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

app.put("/api/personnel/:id", async (req, res) => {
  try {
    const firstName = cleanString(req.body.firstName);
    const lastName = cleanString(req.body.lastName);
    const email = cleanString(req.body.email);
    const departmentID = req.body.departmentID || null;

    if (!firstName || !lastName || !email || !departmentID) {
      return res.status(400).json({
        status: { code: 400, name: "bad request" },
        error: "firstName, lastName, email and departmentID are required"
      });
    }

    const result = await pool.query(
      `
      UPDATE personnel
      SET firstname = $1,
          lastname = $2,
          email = $3,
          departmentid = $4
      WHERE id = $5
      RETURNING id
      `,
      [firstName, lastName, email, departmentID, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: { code: 404, name: "not found" },
        error: "Person not found"
      });
    }

    res.json({
      status: { code: 200, name: "ok" }
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

app.delete("/api/personnel/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM personnel WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: { code: 404, name: "not found" },
        error: "Person not found"
      });
    }

    res.json({
      status: { code: 200, name: "ok" }
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

// -------------------- DEPARTMENTS --------------------

app.get("/api/departments", async (req, res) => {
  const start = Date.now();

  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        l.id AS "locationID",
        l.name AS "locationName"
      FROM department d
      LEFT JOIN location l ON d.locationid = l.id
      ORDER BY d.name ASC
    `);

    console.log(`GET /api/departments took ${Date.now() - start}ms`);

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows
    });
  } catch (err) {
    console.error("Get departments error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

app.delete("/api/departments/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM department WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: { code: 404, name: "not found" },
        error: "Department not found"
      });
    }

    res.json({
      status: { code: 200, name: "ok" }
    });
  } catch (err) {
    console.error("Delete department error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

// -------------------- LOCATIONS --------------------

app.get("/api/locations", async (req, res) => {
  const start = Date.now();

  try {
    const result = await pool.query(`
      SELECT id, name
      FROM location
      ORDER BY name ASC
    `);

    console.log(`GET /api/locations took ${Date.now() - start}ms`);

    res.json({
      status: { code: 200, name: "ok" },
      data: result.rows
    });
  } catch (err) {
    console.error("Get locations error:", err);
    res.status(500).json({
      status: { code: 500, name: "error" },
      error: "Database error"
    });
  }
});

// -------------------- START SERVER --------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});