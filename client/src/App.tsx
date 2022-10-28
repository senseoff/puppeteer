import React, { useContext, useEffect } from "react";
import "./App.css";
import Loader from "./components/Loader/Loader";
import { AppContext } from "./contexts/AppContext";
import Categories from "./components/steps/Categories";

function App() {
  const {
    fetching,
    error,
    Step,
    socket: io,
    setStep,
    setError,
  } = useContext(AppContext);

  useEffect(() => {
    if (!io) return;

    io.on("connect", () => {
      io.on("loaded", () => {
        setStep(Categories);
      });
    });

    io.on("error", (error: string) => {
      setError(error);
    });
  }, []);

  if (error) return <>Error: {error}</>;

  return (
    <div>
      {fetching && <Loader />}
      <div>{Step && <Step />}</div>
    </div>
  );
}

export default App;
