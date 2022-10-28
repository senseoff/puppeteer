import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import Book from "./Book";

const Categories = () => {
  const { fetching, socket: io, setFetching, setStep } = useContext(AppContext);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!io) return;

    io.on("categories", (categories: string[]) => {
      setCategories(categories);
      setFetching(false);
    });
    io.emit("getCategories");

    return () => {
      io.off("categories");
    };
  }, []);

  const handleSelectCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!io) return;
    setFetching(true);
    setStep(Book);
    io.emit("getCategoryBook", e.target.value);
  };

  if (fetching) return <>Getting genres...</>;

  return (
    <select defaultValue=" " onChange={handleSelectCategory}>
      <option value=" " hidden>
        Select one...
      </option>
      {categories.map((category) => (
        <option value={category} key={category}>
          {category}
        </option>
      ))}
    </select>
  );
};

export default Categories;
