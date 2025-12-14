
import { createWalletClient, http, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('--- Farcaster Manifest Signature Generator ---');
  
  // 1. Get Domain
  const domain = await question('Enter your domain (e.g., farcaster.luno.social): ');
  
  // 2. Get FID
  const fidStr = await question('Enter your Farcaster FID: ');
  const fid = parseInt(fidStr, 10);
  
  // 3. Get Private Key
  const privateKey = await question('Enter your private key (starts with 0x): ');
  
  if (!privateKey.startsWith('0x')) {
    console.error('Private key must start with 0x');
    rl.close();
    return;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`\nAddress: ${account.address}`);

  // 4. Construct Header and Payload
  const header = {
    fid: fid,
    type: 'custody',
    key: account.address,
  };
  
  const payload = {
    domain: domain,
  };

  const encode = (obj: any) => {
    const str = JSON.stringify(obj);
    return Buffer.from(str).toString('base64url');
  };

  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  
  const message = `${encodedHeader}.${encodedPayload}`;
  
  console.log(`\nSigning message: ${message}`);

  // 5. Sign Message
  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http()
  });

  const signature = await client.signMessage({
    message: message,
  });

  console.log('\n--- Result for farcaster.json ---');
  console.log(JSON.stringify({
    accountAssociation: {
      header: encodedHeader,
      payload: encodedPayload,
      signature: signature
    }
  }, null, 2));

  rl.close();
}

main().catch(console.error);
