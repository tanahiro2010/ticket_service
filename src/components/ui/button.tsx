import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<undefined> &
  Omit<LinkProps<undefined>, "href"> & { href?: string };

const Button = (props: Props) => {
  if (props.href)
    return (
      <Link
        className={cn(
          `px-5 py-3 border rounded hover:bg-gray-100 cursor-pointer flex flex-row justify-center items-center space-x-3`,
          props.className,
        )}
        href={props.href}
      >
        {props.children}
      </Link>
    );
  else
    return (
      <button
        className={cn(
          `px-5 py-3 border rounded hover:bg-gray-100 cursor-pointer flex flex-row justify-center items-center space-x-3`,
          props.className,
        )}
        type={"button"}
      >
        {props.children}
      </button>
    );
};

export default Button;
