import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "./store";

/**
 * Render komponen dengan Redux store dan router memori.
 * - preloadedState : state awal store untuk skenario tes
 * - route          : alamat awal router, contoh "/auth/login"
 */
export function renderWithProviders(
  ui,
  { preloadedState, store = createStore(preloadedState), route = "/" } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}