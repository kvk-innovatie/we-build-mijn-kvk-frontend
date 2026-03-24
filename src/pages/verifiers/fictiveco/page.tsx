import "./wallet-polyfill";
import "./fictiveco.css";
import GooglePlayConsole from "./components/GooglePlayConsole";
import { useEffect } from "react";

const FictiveCoVerifierPage = () => {
  // Apply scope to body so Radix portal components (dialogs, selects, popovers)
  // also pick up the FictiveCo CSS variables instead of the main app's
  useEffect(() => {
    document.body.classList.add("fictiveco-scope");
    return () => document.body.classList.remove("fictiveco-scope");
  }, []);

  return (
    <div className="fictiveco-scope min-h-screen">
      <GooglePlayConsole />
    </div>
  );
};

export default FictiveCoVerifierPage;
