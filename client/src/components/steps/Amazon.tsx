import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import Checkout from "./Checkout";

const Amazon = () => {
  const { socket: io, setStep, setFetching } = useContext(AppContext);
  const [login, setLogin] = useState("");

  useEffect(() => {
    if (!io) return;

    io.on("login", () => {
      setLogin("Please log in");
    });

    io.on("bought", (book: string) => {
      setFetching(false);
      setStep(Checkout);
    });

    return () => {
      io.off("login");
      io.off("bought");
    };
  }, []);

  return <>{login || "Buying a book..."}</>;
};

export default Amazon;
