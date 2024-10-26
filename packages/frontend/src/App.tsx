import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { caidoTheme, StyledSplitter, StyledBox } from "caido-material-ui";
import { Button, Typography } from "@mui/material";
import { CaidoSDK } from "@/types";
import "allotment/dist/style.css";
import "./styles/style.css";
import { SDKProvider } from "./context/SDKContext";

interface AppProps {
  sdk: CaidoSDK;
}
export const App = ({sdk}: AppProps) => {

  const testing = () => {
    sdk.window.showToast("Message to display.", {
  variant: "info",
  duration: 3000,
});
  }

  return (
    <SDKProvider sdk={sdk}>
    <ThemeProvider theme={caidoTheme}>
      <StyledSplitter>
        <StyledBox className="p-5">
          <Typography variant="h5">Hello World</Typography>
          <Button onClick={testing}>Test</Button>
        </StyledBox>
        <StyledSplitter vertical>
          <StyledBox className="p-5">
            <Typography variant="h5">Caido is awesome</Typography>
          </StyledBox>
          <StyledBox className="p-5">
            <Typography variant="h5">Have a great day!</Typography>
          </StyledBox>
        </StyledSplitter>
      </StyledSplitter>
    </ThemeProvider>
    </SDKProvider>

  );
};
