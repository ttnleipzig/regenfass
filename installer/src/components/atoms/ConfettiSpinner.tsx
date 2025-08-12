import { Component } from "solid-js";

const ConfettiSpinner: Component = () => {
  return (
    <div class="flex items-center justify-center w-32 h-32">
      <div class="relative">
        {/* Spinner */}
        <div class="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        
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
