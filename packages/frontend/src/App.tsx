import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { caidoTheme, StyledSplitter, StyledBox } from "caido-material-ui";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CaidoSDK } from "@/types";
import "allotment/dist/style.css";
import "./styles/style.css";
import * as jose from "jose";
import { SDKProvider } from "./context/SDKContext";
``;

interface AppProps {
  sdk: CaidoSDK;
}
export const App = ({ sdk }: AppProps) => {
  const [value, setValue] = useState("1");
  const [jwtToken, setJWTToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const [header, setHeader] = useState<string>("");
  const [data, setData] = useState<string>("");

  useEffect(() => {
    setHeader(JSON.stringify(jose.decodeProtectedHeader(jwtToken), null, 2));
    setData(JSON.stringify(jose.decodeJwt(jwtToken), null, 2));
  },[jwtToken])

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <SDKProvider sdk={sdk}>
      <ThemeProvider theme={caidoTheme}>
        <StyledSplitter>
          <StyledSplitter vertical>
            <StyledBox className="p-5">
            <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={2}
                >
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Algorithm
                  </Typography>
                  <Select value="HS256" onChange={() => {}}>
                    <MenuItem value="HS256">HS256</MenuItem>
                    <MenuItem value="HS384">HS384</MenuItem>
                    <MenuItem value="HS512">HS512</MenuItem>
                    <MenuItem value="RS256">RS256</MenuItem>
                    <MenuItem value="RS384">RS384</MenuItem>
                    <MenuItem value="RS512">RS512</MenuItem>
                    <MenuItem value="ES256">ES256</MenuItem>
                    <MenuItem value="ES384">ES384</MenuItem>
                    <MenuItem value="ES512">ES512</MenuItem>
                    <MenuItem value="PS256">PS256</MenuItem>
                    <MenuItem value="PS384">PS384</MenuItem>
                    <MenuItem value="PS512">PS512</MenuItem>
                  </Select>
                </Box>
              <Typography variant="h5">ENCODED</Typography>
              <TextField
                multiline
                rows={10}
                value={jwtToken}
                sx={{ width: "100%", mt: "15px" }}
              />
            </StyledBox>
            <StyledBox className="p-5">
              <Box sx={{ width: "100%", typography: "body1" }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab label="Item One" value="1" />
                      <Tab label="Item Two" value="2" />
                      <Tab label="Item Three" value="3" />
                    </TabList>
                  </Box>
                  <TabPanel value="1">Item One</TabPanel>
                  <TabPanel value="2">Item Two</TabPanel>
                  <TabPanel value="3">Item Three</TabPanel>
                </TabContext>
              </Box>
            </StyledBox>
          </StyledSplitter>
          <StyledSplitter vertical>
            <StyledBox className="p-5">
              <Typography variant="h5">HEADER</Typography>
              <TextField
                multiline
                rows={10}
                value={header}
                sx={{ width: "100%", mt: "15px" }}
              />
            </StyledBox>
            <StyledBox className="p-5">
              <Typography variant="h5">BODY</Typography>
              <TextField
                multiline
                rows={10}
                value={data}
                sx={{ width: "100%", mt: "15px" }}
              />
            </StyledBox>
            <StyledBox className="p-5">
              <Typography variant="h5">VERIFY SIGNATURE</Typography>
              <TextField
                multiline
                rows={10}
                value={data}
                sx={{ width: "100%", mt: "15px" }}
              />
            </StyledBox>
          </StyledSplitter>
        </StyledSplitter>
      </ThemeProvider>
    </SDKProvider>
  );
};
