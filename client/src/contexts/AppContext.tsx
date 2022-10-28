import { createContext, FC, PropsWithChildren, useState } from "react";
import { io, Socket } from "socket.io-client";

type TAppContext = {
  socket?: Socket;
  Step?: () => JSX.Element;
  fetching: boolean;
  error: string;
};

type TAppContextHandlers = {
  setFetching: (fetching: boolean) => void;
  setError: (error: string) => void;
  setStep: (Step: () => JSX.Element) => void;
};

export const AppContext = createContext<TAppContext & TAppContextHandlers>({
  fetching: true,
  error: "",
  setFetching: () => undefined,
  setError: () => undefined,
  setStep: () => undefined,
});

const socket = io("http://localhost:3001/");

export const AppContextWrapper: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<TAppContext>({
    socket,
    fetching: true,
    error: "",
  });

  const setFetching = (fetching: boolean) =>
    setState((prevState) => ({ ...prevState, fetching }));

  const setError = (error: string) =>
    setState((prevState) => ({ ...prevState, error }));

  const setStep = (Step: () => JSX.Element) =>
    setState((prevState) => ({ ...prevState, Step }));

  return (
    <AppContext.Provider value={{ ...state, setFetching, setError, setStep }}>
      {children}
    </AppContext.Provider>
  );
};
