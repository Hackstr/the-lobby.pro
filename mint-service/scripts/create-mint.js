import { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createMint } from '@solana/spl-token'

async function main() {
  const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed')

  const authority = Keypair.generate()
  console.log('Mint authority pubkey:', authority.publicKey.toBase58())

  const airdropSig = await connection.requestAirdrop(authority.publicKey, 2 * LAMPORTS_PER_SOL)
  await connection.confirmTransaction(airdropSig, 'confirmed')
  console.log('Airdropped 2 SOL to authority')

  const decimals = 9
  const mintPubkey = await createMint(connection, authority, authority.publicKey, null, decimals)

  console.log('SKILLS Mint (Devnet):', mintPubkey.toBase58())
  console.log('MINT_AUTHORITY_SECRET_KEY_JSON:', JSON.stringify(Array.from(authority.secretKey)))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


