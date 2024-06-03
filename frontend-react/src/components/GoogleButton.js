import { Box, Button, Stack, Typography } from "@mui/material";

/**
 * @param {{ title: string, handle: MouseEventHandler<HTMLAnchorElement> }} param0
 * @returns
 */
export function GoogleButton({ title, handle }) {
  return (
    <>
      <button
        fullWidth
        style={{
          cursor: "pointer",
          backgroundColor: "white",
          color: "black",
          textTransform: "none",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
        }}
        startIcon={<img alt="google logo" src="/google-logo.svg" width={28} height={28} />} // Optional: Add a Google logo to the button
        onClick={handle}
      >
        {title}
      </button>
    </>
  );
}
