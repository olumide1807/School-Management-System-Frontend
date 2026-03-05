import { createTheme } from "@mui/material/styles";
// import { PaletteOptions } from "@mui/material/styles/createPalette";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
  }
}
declare module "@mui/material/styles" {
  interface PaletteColor {
    tertiary?: string;
  }

  interface SimplePaletteColorOptions {
    tertiary?: string;
  }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

const theme = createTheme({
  palette: {
    action: {
      disabledBackground: "", // don't set the disable background color
      disabled: "white", // set the disable foreground color
      hover: "#EFF5F8",
    },
    primary: {
      main: "#43A6CA",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#001C26",
    },
    tertiary: {
      main: "#0E7094",
    },
  },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#0E7094",
          "&.Mui-checked": {
            color: "#0E7094",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#EFF5F8",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
