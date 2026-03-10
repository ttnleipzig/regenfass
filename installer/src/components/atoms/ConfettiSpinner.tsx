import { Component } from "solid-js";
import { Spinner } from "./Spinner.tsx";

const ConfettiSpinner: Component = () => {
  return (
    <div class="flex items-center justify-center w-32 h-32">
      <div class="relative">
        {/* Spinner */}
        <Spinner size="lg" class="text-primary" />
        
        {/* Confetti-Effekt */}
        <div class="absolute inset-0">
          <div class="absolute w-2 h-4 bg-red-500 opacity-60 animate-bounce" style="top: -10px; left: 20px;"></div>
          <div class="absolute w-2 h-4 bg-blue-500 opacity-60 animate-bounce" style="top: -5px; right: 15px; animation-delay: 0.3s;"></div>
          <div class="absolute w-2 h-4 bg-green-500 opacity-60 animate-bounce" style="bottom: -10px; left: 10px; animation-delay: 0.6s;"></div>
          <div class="absolute w-2 h-4 bg-yellow-500 opacity-60 animate-bounce" style="bottom: -5px; right: 25px; animation-delay: 0.9s;"></div>
        </div>
      </div>
    </div>
  );
};

export default ConfettiSpinner;
