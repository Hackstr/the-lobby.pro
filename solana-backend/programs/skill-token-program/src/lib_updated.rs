use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("8YucZC8CdypsXGFh35VxRKbSrm8T4hzSXbHGnxvE6VmN");

#[program]
pub mod skill_token_program {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.authority = ctx.accounts.authority.key();
        player_stats.headshots = 0;
        player_stats.kill_streaks = 0;
        player_stats.total_kills = 0;
        player_stats.xp = 0;
        player_stats.skills_tokens = 0;
        player_stats.last_kill_time = 0; // Для streak tracking
        player_stats.current_streak = 0; // Текущая серия
        player_stats.bump = ctx.bumps.player_stats;
        
        msg!("Player initialized: {}", ctx.accounts.authority.key());
        Ok(())
    }

    pub fn process_kill_event(ctx: Context<ProcessKillEvent>, kill_type: String) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        
        // Обновляем статистику
        player_stats.total_kills += 1;
        
        let mut tokens_to_mint = 0_u64;
        let mut reason = String::new();
        
        // 🎯 ЛОГИКА НАГРАД:
        
        // 1. HEADSHOT = 1 токен сразу
        if kill_type == "headshot" {
            player_stats.headshots += 1;
            tokens_to_mint += 1_000_000; // 1 SKILLS токен (6 decimals)
            reason.push_str("Headshot +1 SKILLS");
            
            msg!("🎯 HEADSHOT! Player: {}, Total headshots: {}", 
                 ctx.accounts.authority.key(), player_stats.headshots);
        }
        
        // 2. КАЖДЫЙ 10-Й KILL = 1 токен  
        if player_stats.total_kills % 10 == 0 {
            tokens_to_mint += 1_000_000; // +1 SKILLS за 10 киллов
            if !reason.is_empty() { reason.push_str(" + "); }
            reason.push_str("10 Kills +1 SKILLS");
            
            msg!("🔥 10 KILLS MILESTONE! Player: {}, Total kills: {}", 
                 ctx.accounts.authority.key(), player_stats.total_kills);
        }
        
        // 3. STREAK LOGIC (БЕЗ ВРЕМЕННЫХ ЛИМИТОВ!)
        // ❌ УБРАЛИ rate limiting - в CS2 можно быстро убивать!
        
        // Streak продолжается всегда, сбрасывается только при смерти игрока
        player_stats.current_streak += 1;
        
        player_stats.last_kill_time = current_time;
        
        // Награды за серии
        match player_stats.current_streak {
            5 => {
                tokens_to_mint += 1_000_000; // +1 за серию 5
                if !reason.is_empty() { reason.push_str(" + "); }
                reason.push_str("5-Kill Streak +1 SKILLS");
                msg!("🔥 5-KILL STREAK! Player: {}", ctx.accounts.authority.key());
            },
            10 => {
                tokens_to_mint += 3_000_000; // +3 за серию 10
                player_stats.kill_streaks += 1;
                if !reason.is_empty() { reason.push_str(" + "); }
                reason.push_str("10-Kill Streak +3 SKILLS");
                msg!("🚀 10-KILL STREAK! Player: {}", ctx.accounts.authority.key());
            },
            15 => {
                tokens_to_mint += 5_000_000; // +5 за серию 15
                if !reason.is_empty() { reason.push_str(" + "); }
                reason.push_str("15-Kill Streak +5 SKILLS");
                msg!("💀 15-KILL STREAK! Player: {}", ctx.accounts.authority.key());
            },
            _ => {} // Остальные серии без наград
        }
        
        // MINT ТОКЕНЫ если заслужил
        if tokens_to_mint > 0 {
            let cpi_accounts = MintTo {
                mint: ctx.accounts.skills_mint.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            };
            
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            
            mint_to(cpi_ctx, tokens_to_mint)?;
            
            // Обновляем статистику
            player_stats.skills_tokens += tokens_to_mint;
            player_stats.xp = (player_stats.headshots * 15) + (player_stats.kill_streaks * 100) + (player_stats.total_kills * 2);
            
            msg!("🪙 SKILLS MINTED! Player: {}, Amount: {}, Reason: {}, Total: {}", 
                 ctx.accounts.authority.key(), tokens_to_mint / 1_000_000, reason, player_stats.skills_tokens / 1_000_000);
        } else {
            // Обновляем XP даже без токенов
            player_stats.xp = (player_stats.headshots * 15) + (player_stats.kill_streaks * 100) + (player_stats.total_kills * 2);
        }
        
        Ok(())
    }

    // Legacy метод для совместимости (можно удалить позже)
    pub fn mint_skills_token(ctx: Context<MintSkillsToken>, amount: u64, achievement_type: String) -> Result<()> {
        // Redirect to new method
        if achievement_type == "headshot" {
            return Self::process_kill_event(ctx.into(), "headshot".to_string());
        } else {
            return Self::process_kill_event(ctx.into(), "regular".to_string());
        }
    }

    pub fn get_player_stats(ctx: Context<GetPlayerStats>) -> Result<PlayerStats> {
        let player_stats = &ctx.accounts.player_stats;
        msg!("Player stats - Headshots: {}, Streaks: {}, Total Kills: {}, Current Streak: {}", 
             player_stats.headshots, player_stats.kill_streaks, player_stats.total_kills, player_stats.current_streak);
        Ok(*player_stats)
    }
}

// ... (остальные структуры без изменений)

#[derive(Accounts)]
pub struct ProcessKillEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player-stats", authority.key().as_ref()],
        bump = player_stats.bump
    )]
    pub player_stats: Account<'info, PlayerStats>,
    
    #[account(mut)]
    pub skills_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = skills_mint,
        associated_token::authority = authority
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the mint authority for SKILLS token
    pub mint_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(Copy)]
pub struct PlayerStats {
    pub authority: Pubkey,
    pub headshots: u64,
    pub kill_streaks: u64,      // Количество серий по 10+ киллов
    pub total_kills: u64,
    pub xp: u64,
    pub skills_tokens: u64,
    pub last_kill_time: i64,    // Для streak tracking
    pub current_streak: u64,    // Текущая серия киллов
    pub bump: u8,
}

impl PlayerStats {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1; // 97 bytes (добавили 2 поля)
}
