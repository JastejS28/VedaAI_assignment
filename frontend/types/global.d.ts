import type { JSX as ReactJSX } from "react";

declare global {
  // Re-export React's JSX namespace globally for components
  // that use JSX.Element return type annotations
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = ReactJSX.Element;
    type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}
