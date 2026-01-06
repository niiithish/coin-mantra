// Alert types and API management
import { authClient } from "./auth-client";

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

const LOCAL_ALERTS_KEY = "coinwatch_alerts";

/**
 * Get local alerts from localStorage
 */
function getLocalAlerts(): Alert[] {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem(LOCAL_ALERTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save to local alerts
 */
function saveLocalAlerts(alerts: Alert[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(alerts));
}

/**
 * Get all alerts
 */
export async function getAlerts(): Promise<Alert[]> {
  try {
    const session = await authClient.getSession();

    if (!session.data) {
      return getLocalAlerts();
    }

    const response = await fetch("/api/alerts");
    if (!response.ok) {
      if (response.status === 401) {
        return getLocalAlerts();
      }
      throw new Error("Failed to fetch alerts");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return getLocalAlerts();
  }
}

/**
 * Save an alert
 */
export async function saveAlert(
  alert: Omit<Alert, "id" | "createdAt" | "isActive">
): Promise<Alert | null> {
  try {
    const session = await authClient.getSession();

    if (!session.data) {
      const localAlerts = getLocalAlerts();
      const newAlert: Alert = {
        ...alert,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      const updatedAlerts = [...localAlerts, newAlert];
      saveLocalAlerts(updatedAlerts);
      return newAlert;
    }

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
    const session = await authClient.getSession();

    if (!session.data) {
      const localAlerts = getLocalAlerts();
      const updatedAlerts = localAlerts.filter((a) => a.id !== alertId);
      saveLocalAlerts(updatedAlerts);
      return true;
    }

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
  const session = await authClient.getSession();

  if (!session.data) {
    const localAlerts = getLocalAlerts();
    const alertIndex = localAlerts.findIndex((a) => a.id === alertId);
    if (alertIndex === -1) {
      return false;
    }

    localAlerts[alertIndex].isActive = !localAlerts[alertIndex].isActive;
    saveLocalAlerts(localAlerts);
    return true;
  }

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
    const session = await authClient.getSession();

    if (!session.data) {
      const localAlerts = getLocalAlerts();
      const alertIndex = localAlerts.findIndex((a) => a.id === alertId);
      if (alertIndex === -1) {
        return false;
      }

      localAlerts[alertIndex] = { ...localAlerts[alertIndex], ...updates };
      saveLocalAlerts(localAlerts);
      return true;
    }

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

/**
 * Clear the local alerts
 */
export function clearLocalAlerts(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_ALERTS_KEY);
  }
}

/**
 * Sync local alerts to database
 */
export async function syncAlertsToDb(): Promise<void> {
  const localAlerts = getLocalAlerts();
  if (localAlerts.length === 0) {
    return;
  }

  const session = await authClient.getSession();
  if (!session.data) {
    return;
  }

  console.log("Syncing local alerts to DB...");

  for (const alert of localAlerts) {
    const { id, createdAt, isActive, ...alertData } = alert;
    await saveAlert(alertData);
  }

  clearLocalAlerts();
}
