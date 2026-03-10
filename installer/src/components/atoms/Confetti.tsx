import { Component } from "solid-js";
import { cn } from "@/libs/cn.ts";

interface ConfettiProps {
  /** Whether the confetti animation should be active */
  active?: boolean;
}

/**
 * Confetti animation component for celebrating successful actions
 */
const Confetti: Component<ConfettiProps> = (props) => {
  return (
    <div class="relative w-48 h-48">
      {props.active && (
        <>
          <div class="absolute w-3 h-6 bg-destructive opacity-80 animate-bounce" style="top: 20px; left: 20px;"></div>
          <div class="absolute w-3 h-6 bg-primary opacity-80 animate-bounce" style="top: 40px; left: 60px; animation-delay: 0.2s;"></div>
          <div class="absolute w-3 h-6 bg-green-500 opacity-80 animate-bounce" style="top: 60px; left: 100px; animation-delay: 0.4s;"></div>
          <div class="absolute w-3 h-6 bg-yellow-500 opacity-80 animate-bounce" style="top: 80px; left: 140px; animation-delay: 0.6s;"></div>
          <div class="absolute w-3 h-6 bg-purple-500 opacity-80 animate-bounce" style="top: 100px; left: 180px; animation-delay: 0.8s;"></div>
        </>
      )}
      <div class="text-center mt-32">
        <p class={cn("text-sm text-muted-foreground")}>Confetti {props.active ? 'aktiv' : 'inaktiv'}</p>
      </div>
    </div>
  );
};

export default Confetti;
