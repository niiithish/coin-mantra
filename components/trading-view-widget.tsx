"use client"
// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "dataSource": "SPX500",
          "blockSize": "volume",
          "blockColor": "change",
          "grouping": "no_group",
          "locale": "en",
          "symbolUrl": "",
          "colorTheme": "dark",
          "exchanges": [
            "NASDAQ"
          ],
          "hasTopBar": false,
          "isDataSetEnabled": false,
          "isZoomEnabled": false,
          "hasSymbolTooltip": false,
          "isMonoSize": false,
          "width": 1000,
          "height": 600
        }`;
            container.current.appendChild(script);
        },
        []
    );

    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(TradingViewWidget);
