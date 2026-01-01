// TopStories.jsx
import { memo, useEffect, useRef } from "react";

function TopStories() {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "all_symbols",
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "width": "100%",
          "height": "100%"
        }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container overflow-hidden rounded-sm"
      ref={container}
    >
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export default memo(TopStories);
