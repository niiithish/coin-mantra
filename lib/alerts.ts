// Alert types and API management

export interface Alert {
  id: string;
  alertName: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  alertType: string;
  condition: string;
  thresholdValue: string;
  frequency: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * Get all alerts from API
 */
export async function getAlerts(): Promise<Alert[]> {
  try {
    const response = await fetch("/api/alerts");
    if (!response.ok) {
      if (response.status === 401) {
        return []; // Not logged in
      }
      throw new Error("Failed to fetch alerts");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

/**
 * Save an alert to API
 */
export async function saveAlert(
  alert: Omit<Alert, "id" | "createdAt" | "isActive">
): Promise<Alert | null> {
  try {
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error("Failed to save alert");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving alert:", error);
    return null;
  }
}

/**
 * Delete an alert by ID
 */
export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/alerts?id=${alertId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting alert:", error);
    return false;
  }
}

/**
 * Toggle alert active status
 */
export async function toggleAlertStatus(alertId: string): Promise<boolean> {
  const alert = await getAlertById(alertId);
  if (!alert) {
    return false;
  }

  try {
    const response = await fetch("/api/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alertId, isActive: !alert.isActive }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error toggling alert status:", error);
    return false;
  }
}

/**
 * Get a single alert by ID
 */
export async function getAlertById(alertId: string): Promise<Alert | null> {
  const alerts = await getAlerts();
  return alerts.find((alert) => alert.id === alertId) || null;
}

/**
 * Get alerts for a specific coin
 */
export async function getAlertsForCoin(coinId: string): Promise<Alert[]> {
  const alerts = await getAlerts();
  return alerts.filter((alert) => alert.coinId === coinId);
}

/**
 * Update an existing alert
 */
export async function updateAlert(
  alertId: string,
  updates: Partial<Omit<Alert, "id" | "createdAt">>
): Promise<boolean> {
  try {
    const response = await fetch("/api/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alertId, ...updates }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating alert:", error);
    return false;
  }
}
