import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "playback-id"?: string;
        "playback-token"?: string;
        "stream-type"?: string;
        "prefer-playback"?: string;
        "primary-color"?: string;
        "secondary-color"?: string;
        "accent-color"?: string;
        "disable-tracking"?: boolean | string;
      };
    }
  }
}
