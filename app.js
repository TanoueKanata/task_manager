const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Task = require('./models/task');
const User = require('./models/user');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      assignedTo: req.body.assignedTo || null
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id/edit', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (req.body.title) task.title = req.body.title;
    if (req.body.description) task.description = req.body.description;
    if (req.body.deadline) task.deadline = new Date(req.body.deadline);
    if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ユーザーの取得エンドポイント
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ユーザーの作成エンドポイント
app.post('/api/users', async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.post('/api/send-tasks', async (req, res) => {
  const channelId = process.env.DISCORD_CHANNEL_ID;

  try {
    const tasks = await Task.find();
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      console.log(`Sending tasks to channel: ${channel.name}`);
      let taskMessage = 'タスク一覧:\n';
      tasks.forEach(task => {
        const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
        taskMessage += `• ${task.title} - ${task.description} (締め切り: ${deadline})\n`;
      });
      channel.send(taskMessage)
        .then(() => res.json({ message: 'Tasks sent to Discord' }))
        .catch(err => {
          console.error('Error sending message to Discord:', err);
          res.status(500).json({ message: 'Error sending message to Discord' });
        });
    } else {
      console.error(`Discord channel not found: ${channelId}`);
      res.status(500).json({ message: 'Discord channel not found' });
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
