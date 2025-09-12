// 🪙 SKILLS TOKEN CONFIG (UPDATED с 10M токенов!)
export const SKILLS_TOKEN = {
  // ✅ ОСНОВНОЙ ТОКЕН (уже в Phantom)
  mintAddress: "JB7hL4i1yQebgcZHkMzRpNm2GukEKiE2q11jyzKtLs5D",
  symbol: "SKILLS",
  name: "Skills Token", 
  decimals: 6,
  network: "devnet",
  
  // 🆕 АЛЬТЕРНАТИВНЫЙ ТОКЕН (если нужен новый)
  altMintAddress: "GL65EYxWdkZGAbzvY3iihKPRUZ2WcJuMv31hXt8Rt5Ux",
  
  // 🔗 EXPLORER LINKS
  explorerUrl: "https://explorer.solana.com/address/JB7hL4i1yQebgcZHkMzRpNm2GukEKiE2q11jyzKtLs5D?cluster=devnet",
  altExplorerUrl: "https://explorer.solana.com/address/GL65EYxWdkZGAbzvY3iihKPRUZ2WcJuMv31hXt8Rt5Ux?cluster=devnet",
  
  // 📊 TOKEN INFO (UPDATED!)
  totalSupply: 10000000, // 🔥 10 МИЛЛИОНОВ!
  mintAuthority: "EpJiBvWpW6yeLdBKGkKyLjvGapAej2h3zji9mN6zfcEo",
  
  // 🎮 EARNING RATES (unchanged)
  rewards: {
    headshot: 1, // 1 SKILLS per headshot
    killMilestone: 1, // 1 SKILLS every 10 kills
    streak5: 1, // 1 SKILLS for 5-kill streak
    streak10: 3, // 3 SKILLS for 10-kill streak  
    streak15: 5, // 5 SKILLS for 15-kill streak
    streak20: 10 // 10 SKILLS for 20-kill streak
  }
};

export default SKILLS_TOKEN;