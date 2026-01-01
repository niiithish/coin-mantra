// TopStories.jsx
import React, { useEffect, useRef, memo } from "react";

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
    <div className="tradingview-widget-container rounded-sm overflow-hidden" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TopStories);
