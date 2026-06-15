import React from "react";

export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

interface BadgeProps {
  tier: Tier;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ tier, className = "" }) => {
  const styles = {
    Bronze: "bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#CD7F32]",
    Silver: "bg-[#C0C0C0]/10 border-[#C0C0C0]/30 text-[#C0C0C0]",
    Gold: "bg-accent/10 border-accent/30 text-text-accent",
    Platinum: "bg-[#E5E4E2]/10 border-[#E5E4E2]/30 text-[#E5E4E2] shadow-[0_0_15px_rgba(229,228,226,0.15)]",
  };

  return (
    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-xs select-none ${styles[tier]} ${className}`}>
      {tier} MEMBER
    </span>
  );
};
