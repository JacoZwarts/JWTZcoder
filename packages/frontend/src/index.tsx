import { createRoot } from 'react-dom/client';
import { CaidoSDK } from "./types";
import { App } from "@/App";
import { initialize } from './features/jwt-decoder';
import { EvenBetterAPI } from '@bebiks/evenbetter-api';

export const init = (sdk: CaidoSDK) => {
  const evenBetterAPI = new EvenBetterAPI(sdk, {
    manifestID: "evenbetter",
    name: "EvenBetter",
  });
  initialize(sdk, evenBetterAPI);
  const rootElement = document.createElement("div");
  Object.assign(rootElement.style, {
    height: "100%",
    width: "100%",
  });

  const root = createRoot(rootElement);
  root.render(<App sdk={sdk}/>);

  sdk.navigation.addPage("/jwtzcoder", {
    body: rootElement,
  });

  sdk.sidebar.registerItem("JWT-ZCoder", "/jwtzcoder", {
    icon: "fas fa-shield-halved",
  });
};