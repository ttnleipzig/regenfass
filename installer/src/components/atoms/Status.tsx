import { Component, createSignal, onMount } from "solid-js";

interface StatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

const Status: Component<StatusProps> = (props) => {
  const [bubble, setBubble] = createSignal('bg-green-500');

  const statusBubbles = [
    {
      title: "Success",
      color: "bg-green-500",
    },
    {
      title: "Warning", 
      color: "bg-yellow-500",
    },
    {
      title: "Error",
      color: "bg-red-500",
    }
  ];

  onMount(() => {
    // change status every 4 seconds
    setInterval(() => {
      setBubble(statusBubbles[Math.floor(Math.random() * statusBubbles.length)].color);
    }, 4000);
  });

  return (
    <span class="relative inline-flex w-40" data-testid="status-indicator">
      <p class="mb-0 text-sm font-bold pl-5">{props.message}</p>
      <span 
        class="absolute top-2 left-0 flex w-3 h-3 -mt-1 -mr-4"
        title=""
      >
        <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-green-400"></span>
        <span class={`relative inline-flex w-3 h-3 rounded-full ${bubble()}`}></span>
      </span>
    </span>
  );
};

export default Status;

