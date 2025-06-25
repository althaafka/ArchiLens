import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#44403c',
    },
    secondary: {
      main: '#fafaf9',
    },
    background: {
      default: '#F4F1EC',
    },
  },
  typography: {
    fontSize: 12,
  },
  components: {
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: '0.75rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;