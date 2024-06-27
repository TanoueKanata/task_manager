const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/task');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// ボットが起動したときに呼ばれるイベント
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // DiscordチャンネルIDの検証
  const channelID = process.env.DISCORD_CHANNEL_ID;
  console.log(`Configured Discord channel ID: ${channelID}`);
  
  const channel = client.channels.cache.get(channelID);
  if (channel) {
    console.log(`Connected to Discord channel: ${channel.name}`);
  } else {
    console.error(`Discord channel not found: ${channelID}`);
  }

  // 毎日午前9時に実行するタスク
  cron.schedule('0 9 * * *', async () => {
    const tasks = await Task.find({
      deadline: { $exists: true, $ne: null },
      completed: false
    });

    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    tasks.forEach(task => {
      const deadline = new Date(task.deadline);
      const diff = deadline - now;

      // 期限が24時間以内のタスクを通知
      if (diff <= oneDayInMs && diff > 0) {
        const channel = client.channels.cache.get(channelID);
        if (channel) {
          channel.send(`🔔 期限が近いタスクがあります: ${task.title} - ${task.description} (締め切り: ${deadline.toLocaleDateString()})`)
            .catch(err => console.error('Error sending message to Discord:', err));
        } else {
          console.error(`Discord channel not found: ${channelID}`);
        }
      }
    });
  });
});

// Discordにログイン
client.login(process.env.DISCORD_BOT_TOKEN).catch(err => console.error('Error logging in to Discord:', err));
