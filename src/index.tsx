import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

document.getElementById("btn-show")!.addEventListener("click", () => {
	(document.getElementById("about-dialog") as HTMLDialogElement).showModal();
});
createRoot(document.getElementById("root")!).render(<App />);
