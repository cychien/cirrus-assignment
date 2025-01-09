import * as React from "react";
import { useSpinDelay } from "spin-delay";
import { Button, type ButtonProps } from "../Button";
import { LoaderCircle } from "lucide-react";
import { cn } from "~/utils/misc";

const StatusButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    status: "pending" | "success" | "error" | "idle";
    message?: string | null;
    spinDelay?: Parameters<typeof useSpinDelay>[1];
  }
>(({ status, className, children, spinDelay, ...props }, ref) => {
  const delayedPending = useSpinDelay(status === "pending", {
    delay: 400,
    minDuration: 300,
    ...spinDelay,
  });
  const companion = {
    pending: delayedPending ? (
      <div className="inline-flex h-5 w-5 items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    ) : null,
    success: null,
    error: null,
    idle: null,
  }[status];

  return (
    <Button
      ref={ref}
      className={cn("flex justify-center gap-2", className)}
      {...props}
    >
      {companion}
      <div>{children}</div>
    </Button>
  );
});

StatusButton.displayName = "StatusButton";

export { StatusButton };
