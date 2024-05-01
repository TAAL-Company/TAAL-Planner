import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import $ from "jquery";
import { LicenseInfo } from "@mui/x-license-pro";
import { muiLicenseKey } from "./TopSecret";
import posthog from "posthog-js";
import { PostHogProvider } from 'posthog-js/react'

posthog.init('phc_GI1wu4eVOdPZaWmNCsmrvGzisDDLPX1StZIR6mcJGJ6', { api_host:'https://us.i.posthog.com' })

LicenseInfo.setLicenseKey(muiLicenseKey);

ReactDOM.render(
  <React.StrictMode>
    <PostHogProvider >
      <App  />
    </PostHogProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
