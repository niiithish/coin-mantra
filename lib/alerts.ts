// Alert types and localStorage management

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

const ALERTS_STORAGE_KEY = "coinwatch_alerts";

/**
 * Get all alerts from localStorage
 */
export function getAlerts(): Alert[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const alertsJson = localStorage.getItem(ALERTS_STORAGE_KEY);
    return alertsJson ? JSON.parse(alertsJson) : [];
  } catch (error) {
    console.error("Error reading alerts from localStorage:", error);
    return [];
  }
}

/**
 * Save an alert to localStorage
 */
export function saveAlert(
  alert: Omit<Alert, "id" | "createdAt" | "isActive">
): Alert {
  const alerts = getAlerts();

  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  alerts.push(newAlert);

  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error("Error saving alert to localStorage:", error);
  }

  return newAlert;
}

/**
 * Delete an alert by ID
 */
export function deleteAlert(alertId: string): void {
  const alerts = getAlerts();
  const filteredAlerts = alerts.filter((alert) => alert.id !== alertId);

  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(filteredAlerts));
  } catch (error) {
    console.error("Error deleting alert from localStorage:", error);
  }
}

/**
 * Toggle alert active status
 */
export function toggleAlertStatus(alertId: string): Alert | null {
  const alerts = getAlerts();
  const alertIndex = alerts.findIndex((alert) => alert.id === alertId);

  if (alertIndex === -1) {
    return null;
  }

  alerts[alertIndex].isActive = !alerts[alertIndex].isActive;

  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error("Error updating alert in localStorage:", error);
  }

  return alerts[alertIndex];
}

/**
 * Get a single alert by ID
 */
export function getAlertById(alertId: string): Alert | null {
  const alerts = getAlerts();
  return alerts.find((alert) => alert.id === alertId) || null;
}

/**
 * Get alerts for a specific coin
 */
export function getAlertsForCoin(coinId: string): Alert[] {
  const alerts = getAlerts();
  return alerts.filter((alert) => alert.coinId === coinId);
}

/**
 * Update an existing alert
 */
export function updateAlert(
  alertId: string,
  updates: Partial<Omit<Alert, "id" | "createdAt">>
): Alert | null {
  const alerts = getAlerts();
  const alertIndex = alerts.findIndex((alert) => alert.id === alertId);

  if (alertIndex === -1) {
    return null;
  }

  alerts[alertIndex] = { ...alerts[alertIndex], ...updates };

  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error("Error updating alert in localStorage:", error);
  }

  return alerts[alertIndex];
}
