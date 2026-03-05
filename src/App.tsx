import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AllRoutes from "./Routes";
import CircularLoader from "./Components/CircularLoader";
import theme from "./theme";
import { ScrollToTop } from "./Routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={<CircularLoader />} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <ScrollToTop />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <ToastContainer />
                <AllRoutes />
              </LocalizationProvider>
            </BrowserRouter>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
