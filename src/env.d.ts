/// <reference types="astro/client" />
interface ImportMetaEnv {readonly PUBLIC_SITE_URL?:string;readonly PUBLIC_SHOW_DRAFT_CONTENT?:string;readonly PUBLIC_SITE_READY?:string;readonly PUBLIC_PROFILE_CLAIMS_VERIFIED?:string;readonly PUBLIC_FORMS_ENABLED?:string;readonly PUBLIC_GOOGLE_ANALYTICS_ID?:string;readonly PUBLIC_META_PIXEL_ID?:string;readonly PUBLIC_TURNSTILE_SITE_KEY?:string;}
interface ImportMeta {readonly env:ImportMetaEnv;}
interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;fbq?:((...args:unknown[])=>void)&{callMethod?:(...args:unknown[])=>void;queue?:unknown[];loaded?:boolean;version?:string;};turnstile?:{reset:(widgetId?:string|HTMLElement)=>void};}
