const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Team = require('./models/Team');
const verifyToken = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const PORT = process.env.PORT || 3002;


// create team
app.post('/api/teams', verifyToken, async (req, res) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Only Admins can create teams' });
  }

  try {
    const { name, description, leaderId, members } = req.body;
    
    const initialMembers = members ? [...members] : [];
    if (!initialMembers.includes(leaderId)) {
        initialMembers.push(leaderId);
    }

    const team = await Team.create({
      name,
      description,
      leaderId,
      members: initialMembers
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// see teams
app.get('/api/teams', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.userRole !== 'ADMIN') {
      query = {
        $or: [
          { members: req.userId },
          { leaderId: req.userId }
        ]
      };
    }

    const teams = await Team.find(query);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// edit team
app.put('/api/teams/:id', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (req.body.members) {
        team.members = req.body.members;
    }

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Team Service running on port ${PORT}`);
});