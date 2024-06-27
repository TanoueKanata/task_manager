
# タスクマネージャー

Discord連携機能を持つシンプルなタスクマネージャーアプリケーションです。

## 主な機能

- タスクの追加、編集、削除、完了マーク
- ユーザーへのタスク割り当て
- Discordチャンネルへのタスクリスト送信

## 使用技術

- Node.js
- Express
- [MongoDB](https://www.mongodb.com/try/download/community)
- Mongoose
- Discord.js
- HTML/CSS/JavaScript

## Discord Botの設定:

- [Discord Developer Portal](https://discord.com/developers/docs/intro)にアクセスし、新しいアプリケーションを作成します。
- アプリケーションにボットを追加し、ボットのトークンをコピーします。
- ボットをDiscordサーバーに招待します。
- チャンネルを右クリック

![image](https://github.com/TanoueKanata/task-manager/assets/107596109/9d993929-f291-4eda-b44d-dd5353536693)

- チャンネルIDをコピー

![スクリーンショット 2024-06-27 225754](https://github.com/TanoueKanata/task-manager/assets/107596109/63915889-ee7a-4708-95f8-41d285d736af)





## インストール

1. リポジトリをクローン:
   ```sh
   git clone https://github.com/TanoueKanata/task-manager.git
   cd task-manager
   ```

2. 依存関係をインストール:
   ```sh
   npm install
   ```
3. ルートディレクトリに `.env` ファイルを作成し、環境変数を追加:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_discord_channel_id
   MONGODB_URI=your_mongodb_uri
   ```

4. アプリケーションを起動:
   ```sh
   node app.js
   node bot.js
   ```

5. ブラウザを開き、 `http://localhost:3000` にアクセス。

## 使用方法

- ユーザーを追加(ログインの機能などは実装していないためメールアドレス、パスワードは特に意味はないです)
- フォームにタスク情報を入力してタスクを追加
- ユーザーにタスクを割り当て
- Discordチャンネルにタスクリストを送信
