const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const verifyToken = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

const dbConfig = {
  host: process.env.DB_HOST || 'mysql_db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'userpassword',
  database: process.env.DB_NAME || 'pms_users'
};

let db;
function handleDisconnect() {
  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to MySQL');
    }
  });

  db.on('error', err => {
    console.error('MySQL error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();


// register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  if(!password) return res.status(400).json({message: "Password required"});

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO Users (username, email, password, firstName, lastName, role, isActive) VALUES (?, ?, ?, ?, ?, "MEMBER", false)';
  
  db.query(sql, [username, email, hashedPassword, firstName, lastName], (err, result) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

//login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM Users WHERE username = ?';

  db.query(sql, [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];

    if (!user.isActive) return res.status(403).json({ message: 'Account pending approval' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '24h' }
    );

    res.json({ accessToken: token, username: user.username, role: user.role, id: user.id });
  });
});


app.get('/api/users', verifyToken, (req, res) => {
  const sql = 'SELECT id, username, email, firstName, lastName, role, isActive FROM Users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

app.get('/api/admin/users', verifyToken, (req, res) => {
  const sql = 'SELECT id, username, email, firstName, lastName, role, isActive FROM Users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

app.patch('/api/admin/users/:id', verifyToken, (req, res) => {
  const { isActive, role } = req.body;
  let sql = 'UPDATE Users SET ';
  let params = [];

  if (isActive !== undefined) {
    sql += 'isActive = ? ';
    params.push(isActive);
  }
  
  if (role) {
    if (params.length > 0) sql += ', ';
    sql += 'role = ? ';
    params.push(role);
  }

  
  if(sql.endsWith(', ')) sql = sql.slice(0, -2);

  sql += ' WHERE id = ?';
  params.push(req.params.id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating user' });
    res.json({ message: 'User updated' });
  });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});