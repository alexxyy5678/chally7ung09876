import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Zap, Skull, Users } from "lucide-react";
import type { Challenge } from "@shared/schema";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-sm transition-all hover:border-secondary/30"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Badge 
            variant="outline" 
            className="bg-muted/50 border-secondary/20 text-secondary font-display uppercase tracking-wider"
          >
            {challenge.type === "p2p" ? "P2P Duel" : "Crowd Bet"}
          </Badge>
          <span className="text-xl font-display font-bold text-primary">
            {challenge.amount} USDC
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {challenge.challenger.charAt(1).toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{challenge.challenger}</span>
            </div>
            <div className="text-muted-foreground font-display text-xs">VS</div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">{challenge.opponent}</span>
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                {challenge.opponent.charAt(1).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center text-xs text-muted-foreground">
              {challenge.type === 'p2p' ? <Skull className="w-4 h-4 mr-1" /> : <Users className="w-4 h-4 mr-1" />}
              <span>{challenge.status}</span>
            </div>
            <button className="text-xs font-bold text-secondary hover:text-secondary/80 hover:underline">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
