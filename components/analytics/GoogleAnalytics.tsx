import Script from "next/script";
import { GA_ID } from "@/lib/analytics/ga";

/**
 * Google Analytics 4. Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set (in Netlify's environment variables),
 * loads after the page is interactive so it never slows the first screen, and never loads for visitors whose browser asks
 * not to be tracked. GA4 does not store IP addresses. Ads personalization signals are turned off.
 */
export function GoogleAnalytics() {
  if (!/^G-[A-Z0-9]+$/.test(GA_ID)) return null;
  // One small script: under Do Not Track it stops before Google's script is even requested.
  return (
    <Script id="ga4-init" strategy="afterInteractive">
      {`(function(){if(navigator.doNotTrack==="1"||window.doNotTrack==="1")return;
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};
gtag("js",new Date());gtag("config","${GA_ID}",{allow_google_signals:false,allow_ad_personalization_signals:false});
var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}";document.head.appendChild(s);})();`}
    </Script>
  );
}
