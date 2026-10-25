// Inline pre-hydration script. Runs synchronously when the browser parses the
// initial HTML, BEFORE React hydrates. Reads the persisted theme from
// localStorage (or falls back to prefers-color-scheme) and applies the `dark`
// class on <html>. This is what prevents the "white flash" before the theme
// appears when a returning dark-mode user loads the page.
//
// Workspace routes are always dark (see lib/theme.ts), so the script forces the
// class there too — otherwise a light-preference visitor would get one frame of
// the light palette before the provider corrects it.
import { WORKSPACE_PREFIXES } from "@/lib/theme";

const PREFIXES = JSON.stringify(WORKSPACE_PREFIXES);

const FLASH_SCRIPT = `(function(){try{var k='growthads-theme';var p=location.pathname;var w=${PREFIXES}.some(function(x){return p===x||p.indexOf(x+'/')===0;});var t='dark';if(!w){try{t=localStorage.getItem(k);}catch(e){}}if(t!=='light'&&t!=='dark'){t='dark';}if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export function FlashThemeScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: FLASH_SCRIPT }}
    />
  );
}
