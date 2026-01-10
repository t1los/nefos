const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Task = require('./models/Task');
const verifyToken = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3003;

// create task
app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    
    const { title, description, teamId, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      teamId,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.userId 
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//see tasks
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { teamId, assignedTo } = req.query;
    let query = {};

    if (teamId) query.teamId = teamId;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update task
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updates = req.body;
    
    Object.assign(task, updates);
    
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add commment
app.post('/api/tasks/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text, authorName } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = {
      text,
      authorId: req.userId,
      authorName: authorName || 'Unknown' 
    };

    task.comments.push(comment);
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete task
app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Task Service running on port ${PORT}`);
  });
};

startServer();