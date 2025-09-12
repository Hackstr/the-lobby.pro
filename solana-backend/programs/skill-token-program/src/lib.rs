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
        player_stats.bump = ctx.bumps.player_stats;
        
        msg!("Player initialized: {}", ctx.accounts.authority.key());
        Ok(())
    }

    pub fn mint_skills_token(ctx: Context<MintSkillsToken>, amount: u64, achievement_type: String) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        
        // Update stats based on achievement type
        if achievement_type == "headshot" {
            player_stats.headshots += 1;
            player_stats.total_kills += 1;
        } else if achievement_type == "kill_streak" {
            player_stats.kill_streaks += 1;
            player_stats.total_kills += 10; // Streak = 10 kills
        }
        
        // Mint SKILLS token
        let cpi_accounts = MintTo {
            mint: ctx.accounts.skills_mint.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        mint_to(cpi_ctx, amount)?;
        
        // Update token count and XP
        player_stats.skills_tokens += amount;
        player_stats.xp = (player_stats.headshots * 10) + (player_stats.kill_streaks * 50) + (player_stats.total_kills * 2);
        
        msg!("SKILLS token minted - Type: {}, Amount: {}, Total Tokens: {}, Player: {}", 
             achievement_type, amount, player_stats.skills_tokens, ctx.accounts.authority.key());
        Ok(())
    }

    pub fn get_player_stats(ctx: Context<GetPlayerStats>) -> Result<PlayerStats> {
        let player_stats = &ctx.accounts.player_stats;
        msg!("Player stats - Headshots: {}, Streaks: {}, Total Kills: {}", 
             player_stats.headshots, player_stats.kill_streaks, player_stats.total_kills);
        Ok(*player_stats)
    }
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + PlayerStats::LEN,
        seeds = [b"player-stats", authority.key().as_ref()],
        bump
    )]
    pub player_stats: Account<'info, PlayerStats>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintSkillsToken<'info> {
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

#[derive(Accounts)]
pub struct GetPlayerStats<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"player-stats", authority.key().as_ref()],
        bump = player_stats.bump
    )]
    pub player_stats: Account<'info, PlayerStats>,
}

#[account]
#[derive(Copy)]
pub struct PlayerStats {
    pub authority: Pubkey,
    pub headshots: u64,
    pub kill_streaks: u64,
    pub total_kills: u64,
    pub xp: u64,
    pub skills_tokens: u64,
    pub bump: u8,
}

impl PlayerStats {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 8 + 1; // 73 bytes
}
