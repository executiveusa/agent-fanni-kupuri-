import 'dotenv/config';
import { ZernioClient } from '../src/integrations/zernioClient.js';

const command = process.argv[2] || 'check';
const client = new ZernioClient();

if (command === 'check') {
  const result = await client.authCheck();
  console.log(JSON.stringify({ ok: true, status: result.status, message: 'Zernio API key is valid.' }, null, 2));
  process.exit(0);
}

if (command === 'create-profile') {
  const name = value('--name');
  if (!name) throw new Error('Usage: npm run zernio:setup -- create-profile --name "Client Name" [--description "..."] [--color "#000000"]');
  const result = await client.createProfile({ name, description: value('--description'), color: value('--color') });
  console.log(JSON.stringify(result.data, null, 2));
  process.exit(0);
}

if (command === 'connect-url') {
  const platform = value('--platform');
  const profileId = value('--profile');
  const redirectUrl = value('--redirect');
  if (!platform || !profileId || !redirectUrl) throw new Error('Usage: npm run zernio:setup -- connect-url --platform instagram --profile PROFILE_ID --redirect https://example.com/callback');
  const result = await client.getConnectUrl({ platform, profileId, redirectUrl });
  console.log(JSON.stringify(result.data, null, 2));
  process.exit(0);
}

throw new Error(`Unknown command: ${command}`);

function value(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
