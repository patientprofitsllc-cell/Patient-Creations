// The homepage is served as plain HTML (app/route.ts), outside the React layout, so it can't use TrackView,
// ScrollDepth or trackCta (components/analytics/Track.tsx). This script does the same, by the same rules:
//   - remembers the visitor and where they first came from, exactly as lib/analytics/attribution.ts does (same storage
//     key, same ?ref= and ?utm_* rules), so a purchase later is still credited to the ad or partner that brought them;
//   - records one landing_page_view in our own funnel (the admin Growth page);
//   - sends Google Analytics a cta_click for each button pressed and scroll_depth at 25/50/75/100%, if GA is on.
// It never affects the page: every step is wrapped, and nothing personal is sent.

export const HOME_TRACK_SCRIPT = `<script>(function(){try{
var K="pc_attr",a=null;
try{a=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}
if(!a||typeof a.visitorId!=="string"){var b=new Uint8Array(12);crypto.getRandomValues(b);a={visitorId:Array.prototype.map.call(b,function(x){return x.toString(16).padStart(2,"0")}).join("")}}
var q=new URLSearchParams(location.search),r=q.get("ref");
if(r&&/^[A-Za-z0-9_-]{3,40}$/.test(r))a.ref=r;
["source","medium","campaign"].forEach(function(k){if(a[k]==null){var v=q.get("utm_"+k);if(v)a[k]=v}});
try{localStorage.setItem(K,JSON.stringify(a))}catch(e){}
fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,body:JSON.stringify({event:"landing_page_view",path:location.pathname,visitorId:a.visitorId,ref:a.ref,source:a.source,medium:a.medium,campaign:a.campaign})}).catch(function(){});
var ga=function(n,p){try{if(typeof window.gtag==="function")window.gtag("event",n,p)}catch(e){}};
document.addEventListener("click",function(e){var l=e.target&&e.target.closest&&e.target.closest("a.pill,a.bundle");if(l)ga("cta_click",{cta:(l.getAttribute("href")||"").slice(0,80)})});
var sent={},t=0;addEventListener("scroll",function(){if(t)return;t=requestAnimationFrame(function(){t=0;var m=document.documentElement.scrollHeight-innerHeight,p=m>0?scrollY/m*100:100;[25,50,75,100].forEach(function(k){if(p>=k-1&&!sent[k]){sent[k]=1;ga("scroll_depth",{percent:k,page:location.pathname})}})})},{passive:true});
}catch(e){}})();</script>
`;
