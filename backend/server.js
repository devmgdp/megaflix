const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Favorite movies
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'SEGREDO_SUPER_SECRETO');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/choose-plan', auth, async (req, res) => {
  const { plan } = req.body;

  await db.query(
    'UPDATE users SET plan = $1 WHERE id = $2',
    [plan, req.user.id]
  );

  res.json({ message: 'Plan selected', plan });
});

app.delete('/cancel-plan', auth, async (req, res) => {
  await db.query(
    'UPDATE users SET plan = NULL WHERE id = $1',
    [req.user.id]
  );

  res.json({ message: 'Plan cancelled' });
});

// Add favorite

app.post('/favorites', auth, async (req, res) => {
  const { movieId } = req.body;

  await db.query(
    'INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, movieId]
  );

  res.json({ message: 'Added to favorites' });
});

// Remove favorite

app.delete('/favorites/:movieId', auth, async (req, res) => {
  const { movieId } = req.params;

  await db.query(
    'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
    [req.user.id, movieId]
  );

  res.json({ message: 'Removed from favorites' });
});

// Search favorite

app.get('/favorites', auth, async (req, res) => {
  const result = await db.query(
    'SELECT movie_id FROM favorites WHERE user_id = $1',
    [req.user.id]
  );

  res.json(result.rows.map(row => row.movie_id));
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

    if (!username || username.length < 3) {
    return res.status(400).json({
      error: "Username must be at least 3 characters"
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters"
    });
  }

  await db.query(
    "INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3)",
    [username, email, hash],
  );

  res.json({ message: "Create user" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    "SEGREDO_SUPER_SECRETO",
    { expiresIn: "1h" },
  );

  res.json({
    token,
   user: {
      id: user.id,
      username: user.username,
      plan: user.plan
    }
  });
});


// =====================
// DELETE ACCOUNT
// =====================
app.delete("/delete-account", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      "DELETE FROM favorites WHERE user_id = $1",
      [userId]
    );

    await db.query(
      "DELETE FROM users WHERE id = $1",
      [userId]
    );

    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// =====================
// GET LOGGED USER
// =====================
app.get('/me', auth, async (req, res) => {
  const result = await db.query(
    'SELECT id, username, plan FROM users WHERE id = $1',
    [req.user.id]
  );

  res.json(result.rows[0]);
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});


