import React, { useContext, useEffect } from "react";
import { AppContext } from "../../contexts/AppContext";
import Amazon from "./Amazon";

const Book = () => {
  const { socket: io, setStep } = useContext(AppContext);

  useEffect(() => {
    if (!io) return;

    io.on("book", (book: string) => {
      setStep(Amazon);
      io.emit("buyBook", book);
    });

    return () => {
      io.off("book");
    };
  }, []);

  return <>Getting a book...</>;
};

export default Book;
