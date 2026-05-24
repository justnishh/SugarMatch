"use client";

// =============================================================================
// ADVERTISEMENT SCRIPTS - COMMENTED OUT FOR DEVELOPMENT PHASE
// =============================================================================
// To enable ads, uncomment the relevant sections below

// const POPUNDER_SCRIPT = "https://pl29173087.profitablecpmratenetwork.com/b8/9b/94/b89b9445a8cc7a16eb524bdc794eb2ba.js";
// const NATIVE_BANNER_SCRIPT = "https://pl29173142.profitablecpmratenetwork.com/34ca30df22131347cf739266a7fd9090/invoke.js";
// const SOCIAL_BAR_SCRIPT = "https://pl29173143.profitablecpmratenetwork.com/ee/b6/72/eeb67249413c9862b97f53a52fd19197.js";
// const SMARTLINK_URL = "https://www.profitablecpmratenetwork.com/uw5hemh4?key=d3c08732597f88acaa786e467d391472";

export function AdBanner() {
  // Popunder - loads in background tab
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = POPUNDER_SCRIPT;
  //   script.async = true;
  //   document.head.appendChild(script);

  //   return () => {
  //     const existing = document.head.querySelector(`script[src*="profitablecpmratenetwork.com/b8"]`);
  //     if (existing) document.head.removeChild(existing);
  //   };
  // }, []);

  return null;
}

export function NativeBanner() {
  // Native Banner - appears in content
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = NATIVE_BANNER_SCRIPT;
  //   script.async = true;
  //   script.setAttribute("data-cfasync", "false");
  //   document.body.appendChild(script);

  //   return () => {
  //     const existing = document.body.querySelector(`script[src*="profitablecpmratenetwork.com/34ca30"]`);
  //     if (existing) document.body.removeChild(existing);
  //   };
  // }, []);

  // return (
  //   <div className="w-full flex justify-center py-3">
  //     <div id="container-34ca30df22131347cf739266a7fd9090" />
  //   </div>
  // );

  return null;
}

export function SocialBar() {
  // Social Bar - push notification style
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = SOCIAL_BAR_SCRIPT;
  //   script.async = true;
  //   document.body.appendChild(script);

  //   return () => {
  //     const existing = document.body.querySelector(`script[src*="profitablecpmratenetwork.com/ee"]`);
  //     if (existing) document.body.removeChild(existing);
  //   };
  // }, []);

  return null;
}

export function SmartlinkAd() {
  // Smartlink - clickable button
  // return (
  //   <a
  //     href={SMARTLINK_URL}
  //     target="_blank"
  //     rel="noopener noreferrer"
  //     className="block w-full text-center py-2 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
  //   >
  //     Click Here for Exclusive Offers
  //   </a>
  // );

  return null;
}