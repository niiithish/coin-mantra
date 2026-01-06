"use client";

import { Delete02Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CreateAlertDialog from "@/components/create-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Alert, deleteAlert, getAlertById, getAlerts } from "@/lib/alerts";

// Helper to format condition for display
const formatCondition = (condition: string): string => {
  switch (condition) {
    case "greater_than":
      return ">";
    case "less_than":
      return "<";
    case "equal_to":
      return "=";
    case "greater_than_or_equal":
      return "≥";
    case "less_than_or_equal":
      return "≤";
    default:
      return condition;
  }
};

// Helper to format frequency for display
const formatFrequency = (frequency: string): string => {
  switch (frequency) {
    case "once":
      return "Once";
    case "once_per_day":
      return "Once per day";
    case "every_time":
      return "Every time";
    default:
      return frequency;
  }
};

// Coin price data (mock - in real app this would come from API)
interface CoinPriceData {
  currentPrice: number;
  priceChange24h: number;
  image?: string;
}

const AlertList = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coinPrices, setCoinPrices] = useState<Record<string, CoinPriceData>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch coin prices from CoinGecko API
  const fetchCoinPrices = useCallback(async (coinIds: string[]) => {
    if (coinIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(",")}&price_change_percentage=24h`
      );

      if (response.ok) {
        const data = await response.json();
        const priceMap: Record<string, CoinPriceData> = {};

        for (const coin of data) {
          priceMap[coin.id] = {
            currentPrice: coin.current_price,
            priceChange24h: coin.price_change_percentage_24h || 0,
            image: coin.image,
          };
        }

        setCoinPrices(priceMap);
      }
    } catch (error) {
      console.error("Error fetching coin prices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load alerts from localStorage
  const loadAlerts = useCallback(() => {
    setLoading(true);
    const storedAlerts = getAlerts();
    setAlerts(storedAlerts);

    // Fetch coin prices for all unique coins
    const uniqueCoinIds = [...new Set(storedAlerts.map((a) => a.coinId))];
    fetchCoinPrices(uniqueCoinIds);
  }, [fetchCoinPrices]);

  // Initial load
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDeleteAlert = (alertId: string, alertName: string) => {
    deleteAlert(alertId);
    setAlerts(alerts.filter((a) => a.id !== alertId));
    toast.success(`Alert "${alertName}" deleted`);
  };

  const handleEditAlert = (alertId: string) => {
    const alert = getAlertById(alertId);
    if (alert) {
      setEditingAlert(alert);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingAlert(null);
    }
  };

  const handleAlertUpdated = () => {
    loadAlerts();
    setEditingAlert(null);
    setIsEditDialogOpen(false);
  };

  if (loading) {
    return <Card className="h-full w-full" />;
  }

  if (alerts.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="font-bold text-lg">Price Alerts</h1>
          <CreateAlertDialog onAlertCreated={loadAlerts} />
        </div>
        <Card className="h-full w-full">
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <p className="text-muted-foreground text-sm">
                No alerts created yet
              </p>
              <p className="text-muted-foreground text-sm">
                Create alerts from any coin page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Price Alerts</h1>
        <CreateAlertDialog onAlertCreated={loadAlerts} />
      </div>
      <Card className="h-full w-full overflow-y-auto">
        <CardContent className="flex flex-col gap-4">
          {alerts.map((alert) => {
            const priceData = coinPrices[alert.coinId];
            const currentPrice = priceData?.currentPrice ?? 0;
            const priceChange = priceData?.priceChange24h ?? 0;
            const coinImage = priceData?.image || "";

            return (
              <Card className="bg-secondary/10 py-3" key={alert.id}>
                <CardContent className="flex flex-col gap-3 px-3">
                  {/* Coin Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        alt="No Image"
                        className="rounded-full"
                        height={32}
                        src={coinImage}
                        width={32}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-muted-foreground text-sm">
                          {alert.coinName}
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          $
                          {currentPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-medium text-muted-foreground text-sm">
                        {alert.coinSymbol}
                      </span>
                      <span
                        className={`font-medium text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {priceChange >= 0 ? "+" : ""}
                        {priceChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="border-border border-t" />

                  {/* Alert Info Row */}
                  <div className="flex flex-col justify-between gap-1">
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground text-sm">
                        Alert:
                      </span>
                      <span className="flex flex-row gap-2">
                        <HugeiconsIcon
                          className="cursor-pointer"
                          icon={PencilEdit01Icon}
                          onClick={() => handleEditAlert(alert.id)}
                          size={14}
                        />
                        <HugeiconsIcon
                          className="cursor-pointer"
                          icon={Delete02Icon}
                          onClick={() =>
                            handleDeleteAlert(alert.id, alert.alertName)
                          }
                          size={14}
                        />
                      </span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="font-semibold text-foreground text-sm">
                        Price {formatCondition(alert.condition)} $
                        {alert.thresholdValue}
                      </span>
                      <Badge variant="outline">
                        {formatFrequency(alert.frequency)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Edit Alert Dialog */}
      {editingAlert && (
        <CreateAlertDialog
          editAlert={editingAlert}
          isOpen={isEditDialogOpen}
          onAlertCreated={handleAlertUpdated}
          onOpenChange={handleEditDialogClose}
        />
      )}
    </div>
  );
};

export default AlertList;
