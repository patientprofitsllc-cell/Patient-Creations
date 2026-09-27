import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

/**
 * The site's gold call-to-action button, with a second line that slides into view on hover (from
 * uiverse.io/joe-watson-sbf/ordinary-turtle-50, MIT licensed, recolored to the site's gold gradient
 * instead of the original pink). Renders as a link when `href` is given, otherwise a button.
 *
 * The second line is for something true and useful (what happens next, what's included), never a
 * manufactured urgency claim like a fake stock count.
 */
type Common = { visible: string; reveal: string; className?: string };

export function RevealButton(props: Common & { href: string; prefetch?: boolean }): JSX.Element;
export function RevealButton(props: Common & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element;
export function RevealButton({ visible, reveal, className = "", href, prefetch, ...rest }: Common & { href?: string; prefetch?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const inner = (
    <>
      <span className="btn-reveal__visible">{visible}</span>
      <span className="btn-reveal__hidden">{reveal}</span>
    </>
  );
  const classes = `btn-reveal inline-block text-base font-semibold tracking-wide ${className}`;
  if (href) {
    return (
      <Link href={href} prefetch={prefetch} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {inner}
    </button>
  );
}
