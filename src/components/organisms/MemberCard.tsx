import React from "react";
import { Badge, Tier } from "../atoms/Badge";

interface MemberCardProps {
  name: string;
  memberId: string;
  tier: Tier;
  memberSince: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  name,
  memberId,
  tier,
  memberSince,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface-raised via-surface to-bg border border-accent/20 rounded-md p-6 shadow-elevated group min-h-[220px] flex flex-col justify-between">
      {/* Ambient background light reflections */}
      <div className="absolute -top-24 -left-24 w-52 h-52 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-700 pointer-events-none" />
      
      {/* Header Info */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.25em] font-bold text-text-secondary uppercase">
            FORGE ATHLETIC CLUB
          </span>
          <span className="text-[8px] tracking-widest text-text-muted uppercase font-mono mt-0.5">
            ACCESS PROTOCOL
          </span>
        </div>
        <Badge tier={tier} />
      </div>

      {/* Middle info & smart chip */}
      <div className="flex items-end justify-between mt-8 z-10">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-wide text-text-primary uppercase">
            {name}
          </span>
          <span className="text-[9px] tracking-widest text-text-secondary uppercase font-mono mt-1">
            ACCESS ID: {memberId}
          </span>
        </div>
        
        {/* Decorative champagne microchip */}
        <div className="w-9 h-7 bg-gradient-to-r from-accent/20 to-accent-hover/30 rounded-xs border border-accent/40 flex flex-col justify-between p-1">
          <div className="flex gap-1">
            <span className="w-1.5 h-1 bg-accent/30 rounded-4xs" />
            <span className="w-1.5 h-1 bg-accent/30 rounded-4xs" />
          </div>
          <div className="w-full h-1 bg-accent/20 rounded-4xs" />
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center border-t border-border-subtle pt-4 mt-4 text-[8px] tracking-widest text-text-muted font-mono z-10">
        <div>JOIN DATE: {memberSince}</div>
        <div className="flex items-center gap-1.5 text-success uppercase font-semibold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
          </span>
          SECURE
        </div>
      </div>
    </div>
  );
};
