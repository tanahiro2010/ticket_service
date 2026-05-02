import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode | string;
  className?: string;
  href?: string;
};
const Button = ({ children, className = "", href }: Props) => {
  if (href)
    return (
      <Link
        className={cn(
          `px-5 py-3 border rounded hover:bg-gray-100 cursor-pointer flex flex-row justify-center items-center space-x-3`,
          className,
        )}
        href={href}
      >
        {children}
      </Link>
    );
  else
    return (
      <button
        className={cn(
          `px-5 py-3 border rounded hover:bg-gray-100 cursor-pointer flex flex-row justify-center items-center space-x-3`,
          className,
        )}
        type={"button"}
      >
        {children}
      </button>
    );
};

export default Button;
