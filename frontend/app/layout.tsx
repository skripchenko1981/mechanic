import type { Metadata } from 'next'; import './globals.css';
export const metadata: Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost'),title:{default:'ПИВО МЕХАНІК — крафтове пиво з характером',template:'%s | ПИВО МЕХАНІК'},description:'Крафтове пиво безпосередньо від виробника. Каталог та умови для B2B-партнерів.',openGraph:{type:'website',locale:'uk_UA',siteName:'ПИВО МЕХАНІК'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uk"><body>{children}</body></html>}
