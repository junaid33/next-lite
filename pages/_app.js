import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import { theme } from '../theme';

const GlobalStyle = ({ children }) => (
  <>
    <CSSReset />
    <Global
      styles={css`
        ::selection {
          background-color: #47a3f3;
          color: #fefefe;
        }
        html {
          min-width: 360px;
          /* scroll-behavior: smooth; */
        }
        #__next {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
      `}
    />
    {children}
  </>
);

const App = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <GlobalStyle>
      <Component {...pageProps} />
    </GlobalStyle>
  </ChakraProvider>
);

export default App;
