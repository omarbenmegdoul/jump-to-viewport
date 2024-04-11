import ReactDOM from "react-dom/client";
import React from "react";
import "./css/main.scss";
import { Views } from "./components/Views.tsx";

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector("#app"));
root.render(React.createElement(Views));
