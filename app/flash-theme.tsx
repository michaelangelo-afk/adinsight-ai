// Inline pre-hydration script. Runs synchronously when the browser parses the
// initial HTML, BEFORE React hydrates. Reads the persisted theme from
// localStorage (or falls back to prefers-color-scheme) and applies the `dark`
// class on <html>. This is what prevents the "white flash" before the theme
// appears when a returning dark-mode user loads the page.
const FLASH_SCRIPT = `(function(){try{var k='growthads-theme';var t=null;try{t=localStorage.getItem(k);}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export function FlashThemeScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: FLASH_SCRIPT }}
    />
  );
}
