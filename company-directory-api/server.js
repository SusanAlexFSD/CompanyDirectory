import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required on Render
});

app.get("/api/personnel", async (req, res) => {
  const start = Date.now();

  try {
    const query = `
      SELECT 
        p.id,
        p.first_name AS "firstName",
        p.last_name AS "lastName",
        p.email,
        d.name AS "departmentID",
        l.name AS "locationID"
      FROM personnel p
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN location l ON d.location_id = l.id
      ORDER BY p.last_name, p.first_name, d.name, l.name;
    `;

    const { rows } = await pool.query(query);

    res.json({
      status: {
        code: "200",
        name: "ok",
        description: "success",
        returnedIn: `${Date.now() - start} ms`
      },
      data: rows
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: {
        code: "300",
        name: "failure",
        description: "database unavailable",
        returnedIn: `${Date.now() - start} ms`
      },
      data: []
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
