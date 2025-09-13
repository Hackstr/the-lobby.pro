import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bs58 from 'bs58'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet')
const SKILLS_MINT_ADDRESS = process.env.SKILLS_MINT_ADDRESS
const SKILLS_TOKEN_DECIMALS = Number(process.env.SKILLS_TOKEN_DECIMALS || '9')
const MINT_AUTHORITY_SECRET_KEY_JSON = process.env.MINT_AUTHORITY_SECRET_KEY_JSON

if (!SKILLS_MINT_ADDRESS) {
  console.error('Missing SKILLS_MINT_ADDRESS')
  process.exit(1)
}
if (!MINT_AUTHORITY_SECRET_KEY_JSON) {
  console.error('Missing MINT_AUTHORITY_SECRET_KEY_JSON')
  process.exit(1)
}

const connection = new Connection(RPC_URL, 'confirmed')

function loadKeypairFromJson(jsonStr) {
  try {
    const arr = JSON.parse(jsonStr)
    return Keypair.fromSecretKey(Uint8Array.from(arr))
  } catch (e) {
    // try bs58 string
    const bytes = bs58.decode(jsonStr)
    return Keypair.fromSecretKey(bytes)
  }
}

const mintAuthority = loadKeypairFromJson(MINT_AUTHORITY_SECRET_KEY_JSON)
const mintPubkey = new PublicKey(SKILLS_MINT_ADDRESS)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/mint', async (req, res) => {
  try {
    const { to, amount = 1, memo } = req.body || {}
    if (!to) return res.status(400).json({ error: 'Missing to' })
    const toPubkey = new PublicKey(to)

    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mintPubkey,
      toPubkey,
      true
    )

    // convert human amount to base units (decimals)
    const baseUnits = BigInt(amount) * (BigInt(10) ** BigInt(SKILLS_TOKEN_DECIMALS))

    const sig = await mintTo(
      connection,
      mintAuthority,
      mintPubkey,
      ata.address,
      mintAuthority,
      baseUnits
    )

    res.json({ success: true, signature: sig, token_account: ata.address.toBase58(), mint: mintPubkey.toBase58(), memo: memo || null })
  } catch (e) {
    console.error('Mint error', e)
    res.status(500).json({ success: false, error: e.message || String(e) })
  }
})

app.listen(PORT, () => console.log(`Minter listening on :${PORT}`))


