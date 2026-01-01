// MarketOverview.jsx
import { memo, useEffect, useRef } from "react";

function MarketOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only add script if it doesn't already exist in the container
    if (container.current && container.current.children.length <= 1) {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
          {
            "exchange": "BSE",
            "colorTheme": "dark",
            "dateRange": "12M",
            "showChart": true,
            "locale": "en",
            "largeChartUrl": "",
            "isTransparent": false,
            "showSymbolLogo": false,
            "showFloatingTooltip": false,
            "plotLineColorGrowing": "#dc7701",
            "plotLineColorFalling": "#dc7701",
            "gridLineColor": "rgba(240, 243, 250, 0)",
            "scaleFontColor": "#DBDBDB",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
            "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "width": "100%",
            "height": "100%"
          }`;
      container.current.appendChild(script);
    }
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

export default memo(MarketOverview);
