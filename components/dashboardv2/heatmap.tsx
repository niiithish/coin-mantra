"use client";
import { memo, useEffect, useRef } from "react";

const HeatMap = () => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
          {
            "dataSource": "SENSEX",
            "blockSize": "market_cap_basic",
            "blockColor": "change",
            "grouping": "no_group",
            "locale": "en",
            "symbolUrl": "",
            "colorTheme": "dark",
            "exchanges": [],
            "hasTopBar": false,
            "isDataSetEnabled": false,
            "isZoomEnabled": false,
            "hasSymbolTooltip": false,
            "isMonoSize": false,
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
};

export default memo(HeatMap);
