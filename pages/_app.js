import '../styles/globals.css'
import '../styles/weather-main.css'
import '../styles/bootstrap/font/bootstrap-icons.css' 
import { ThemeProvider } from 'next-themes'

function MyApp({ Component, pageProps }) {
  return (
   <ThemeProvider defaultTheme='system' forcedTheme={Component.theme || null}> 
     <Component {...pageProps} />
  </ThemeProvider>
 )
}

export default MyApp  
 