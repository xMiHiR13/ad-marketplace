import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH!;

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

(async () => {
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await ask("Enter your phone number: "),
    password: async () => await ask("Enter 2FA password (if any): "),
    phoneCode: async () => await ask("Enter the code you received: "),
    onError: (err) => console.log(err),
  });

  console.log("\n✅ Logged in successfully!");
  console.log("\nYour session string:\n");
  console.log(client.session.save());

  await client.disconnect();
})();
