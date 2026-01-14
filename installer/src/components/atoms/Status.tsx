import { Component, createSignal, onMount, Show, Switch, Match } from "solid-js";
import { cn } from "@/libs/cn.ts";
import { Spinner } from "./Spinner.tsx";

interface StatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

const Status: Component<StatusProps> = (props) => {
  const getStatusColor = () => {
    switch (props.status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-destructive';
      case 'loading':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  const getPingColor = () => {
    switch (props.status) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-destructive/75';
      case 'loading':
        return 'bg-primary/75';
      default:
        return 'bg-muted/75';
    }
  };

  return (
    <span class="relative inline-flex items-center gap-2" data-testid="status-indicator">
      <Switch>
        <Match when={props.status === 'loading'}>
          <Spinner size="sm" class="text-primary" />
        </Match>
        <Match when={props.status !== 'loading'}>
          <span 
            class="relative flex w-3 h-3"
            title={props.status}
          >
            <span class={cn(
              "absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping",
              getPingColor()
            )}></span>
            <span class={cn(
              "relative inline-flex w-3 h-3 rounded-full",
              getStatusColor()
            )}></span>
          </span>
        </Match>
      </Switch>
      <p class={cn("mb-0 text-sm font-semibold", "text-foreground")}>{props.message}</p>
    </span>
  );
};

export default Status;

