import type { ReactNode } from "react";

interface WideContainerProps {
  children: ReactNode;
  className?: string;
}

export function WideContainer({ children, className = "" }: WideContainerProps) {
  return <div className={`mx-auto w-full max-w-[1880px] ${className}`}>{children}</div>;
}
