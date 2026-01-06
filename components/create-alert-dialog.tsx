"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlerts } from "@/hooks/use-alerts";
import type { Alert } from "@/lib/alerts";

interface CreateAlertDialogProps {
  coinId?: string;
  coinName?: string;
  coinSymbol?: string;
  onAlertCreated?: () => void;
  // Edit mode props
  editAlert?: Alert;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
  };
}

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  image: string;
  rank: number | null;
}

const alertTypeItems = [
  { label: "Price", value: "price" },
  { label: "Percentage Change", value: "percentage_change" },
  { label: "Volume", value: "volume" },
  { label: "Market Cap", value: "market_cap" },
];

const conditionItems = [
  { label: "Greater than (>)", value: "greater_than" },
  { label: "Less than (<)", value: "less_than" },
  { label: "Equal to (=)", value: "equal_to" },
  { label: "Greater than or equal (≥)", value: "greater_than_or_equal" },
  { label: "Less than or equal (≤)", value: "less_than_or_equal" },
];

const frequencyItems = [
  { label: "Once", value: "once" },
  { label: "Once per day", value: "once_per_day" },
  { label: "Every time", value: "every_time" },
];

// Helper function to get initial selected coin
const getInitialSelectedCoin = (
  editAlert: Alert | undefined,
  initialCoinId: string | undefined,
  initialCoinName: string | undefined,
  initialCoinSymbol: string | undefined
): CoinResult | null => {
  if (editAlert) {
    return {
      id: editAlert.coinId,
      name: editAlert.coinName,
      symbol: editAlert.coinSymbol,
      image: "",
      rank: null,
    };
  }
  if (initialCoinId && initialCoinName && initialCoinSymbol) {
    return {
      id: initialCoinId,
      name: initialCoinName,
      symbol: initialCoinSymbol,
      image: "",
      rank: null,
    };
  }
  return null;
};

// Helper function to build alert data
const buildAlertData = (
  alertName: string,
  selectedCoin: CoinResult,
  alertTypeRef: React.RefObject<string>,
  conditionRef: React.RefObject<string>,
  thresholdValue: string,
  frequencyRef: React.RefObject<string>
) => ({
  alertName: alertName.trim(),
  coinId: selectedCoin.id,
  coinName: selectedCoin.name,
  coinSymbol: selectedCoin.symbol.toUpperCase(),
  alertType: alertTypeRef.current,
  condition: conditionRef.current,
  thresholdValue: thresholdValue.trim(),
  frequency: frequencyRef.current,
});

// Helper function to validate alert form
const validateAlertForm = (
  alertName: string,
  selectedCoin: CoinResult | null,
  thresholdValue: string
): string | null => {
  if (!alertName.trim()) {
    return "Please enter an alert name";
  }
  if (!selectedCoin) {
    return "Please select a coin";
  }
  if (!thresholdValue.trim()) {
    return "Please enter a threshold value";
  }
  return null;
};

// Helper to get reset values for edit mode
const getEditModeResetValues = (editAlert: Alert) => ({
  alertName: editAlert.alertName,
  thresholdValue: editAlert.thresholdValue,
  selectedCoin: {
    id: editAlert.coinId,
    name: editAlert.coinName,
    symbol: editAlert.coinSymbol,
    image: "",
    rank: null,
  } as CoinResult,
  alertType: editAlert.alertType,
  condition: editAlert.condition,
  frequency: editAlert.frequency,
});

const CreateAlertDialog = ({
  coinId: initialCoinId,
  coinName: initialCoinName,
  coinSymbol: initialCoinSymbol,
  onAlertCreated,
  editAlert,
  isOpen,
  onOpenChange,
}: CreateAlertDialogProps) => {
  const isEditMode = !!editAlert;
  const [alertName, setAlertName] = useState(editAlert?.alertName || "");
  const [thresholdValue, setThresholdValue] = useState(
    editAlert?.thresholdValue || ""
  );
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Coin selection state - prioritize editAlert over initial props
  const [selectedCoin, setSelectedCoin] = useState<CoinResult | null>(() =>
    getInitialSelectedCoin(
      editAlert,
      initialCoinId,
      initialCoinName,
      initialCoinSymbol
    )
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CoinResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use refs to track select values since base-ui Select doesn't have controlled state
  const alertTypeRef = useRef(editAlert?.alertType || "price");
  const conditionRef = useRef(editAlert?.condition || "greater_than");
  const frequencyRef = useRef(editAlert?.frequency || "once_per_day");

  // Fetch trending coins for default display
  const fetchTrending = useCallback(async () => {
    try {
      const response = await fetch("/api/coingecko?endpoint=/search/trending");
      const data = await response.json();
      const trendingCoins: CoinResult[] = data.coins
        .slice(0, 6)
        .map((c: TrendingCoin) => ({
          id: c.item.id,
          name: c.item.name,
          symbol: c.item.symbol,
          image: c.item.large,
          rank: c.item.market_cap_rank,
        }));
      setSearchResults(trendingCoins);
    } catch (error) {
      console.error("Error fetching trending coins:", error);
    }
  }, []);

  // Search for coins
  const searchCoins = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchTrending();
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/coingecko?endpoint=/search&query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          setSearchResults([]);
          return;
        }

        const data = await response.json();
        const results: CoinResult[] = data.coins
          .slice(0, 6)
          .map((c: SearchCoin) => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol,
            image: c.large,
            rank: c.market_cap_rank,
          }));
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching coins:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [fetchTrending]
  );

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCoins(value);
    }, 300);
  };

  // Handle coin selection
  const handleSelectCoin = (coin: CoinResult) => {
    setSelectedCoin(coin);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load trending coins when dialog opens
  useEffect(() => {
    if (open && !selectedCoin) {
      fetchTrending();
    }
  }, [open, selectedCoin, fetchTrending]);

  const resetForm = () => {
    setSearchQuery("");
    if (editAlert) {
      // For edit mode, reset to original values
      const resetValues = getEditModeResetValues(editAlert);
      setAlertName(resetValues.alertName);
      setThresholdValue(resetValues.thresholdValue);
      setSelectedCoin(resetValues.selectedCoin);
      alertTypeRef.current = resetValues.alertType;
      conditionRef.current = resetValues.condition;
      frequencyRef.current = resetValues.frequency;
    } else {
      setAlertName("");
      setThresholdValue("");
      if (!initialCoinId) {
        setSelectedCoin(null);
      }
      alertTypeRef.current = "price";
      conditionRef.current = "greater_than";
      frequencyRef.current = "once_per_day";
    }
  };

  const { addAlert, updateAlert } = useAlerts();

  const handleSaveAlert = async () => {
    // Validate form
    const validationError = validateAlertForm(
      alertName,
      selectedCoin,
      thresholdValue
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Early return ensures selectedCoin is not null at this point
    if (!selectedCoin) {
      return;
    }

    const alertData = buildAlertData(
      alertName,
      selectedCoin,
      alertTypeRef,
      conditionRef,
      thresholdValue,
      frequencyRef
    );

    try {
      if (isEditMode && editAlert) {
        // Update existing alert
        await updateAlert({ id: editAlert.id, updates: alertData });
        // Mutation handled toast and invalidation
      } else {
        // Create new alert
        await addAlert(alertData);
        // Mutation handled toast and invalidation
      }
    } catch (_error) {
      // Error is handled in hook
      return;
    }

    // Notify parent component
    onAlertCreated?.();

    // Reset form and close dialog
    if (!isEditMode) {
      resetForm();
    }
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {!isEditMode && (
        <DialogTrigger className="flex cursor-pointer items-center gap-1 rounded-sm bg-primary px-2 py-1 font-medium text-background text-xs">
          Create Alert
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Header */}
        <DialogTitle className="font-bold text-foreground text-lg">
          {isEditMode ? "Edit Alert" : "Price Alert"}
        </DialogTitle>
        {/* Form Content */}
        <div className="mt-2 flex flex-col gap-5">
          {/* Alert Name */}
          <div className="flex flex-col gap-2">
            <Label
              className="text-muted-foreground text-xs"
              htmlFor="alert-name"
            >
              Alert Name
            </Label>
            <Input
              id="alert-name"
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="Bitcoin at Discount"
              value={alertName}
            />
          </div>

          {/* Coin Search */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Coin Name</Label>
            <div className="relative" ref={dropdownRef}>
              {/* Selected coin display or placeholder */}
              <button
                className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-card px-3 transition-colors hover:bg-accent/50"
                onClick={() => {
                  setShowDropdown(true);
                  if (searchResults.length === 0) {
                    fetchTrending();
                  }
                }}
                type="button"
              >
                {selectedCoin ? (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs">
                      {selectedCoin.name}
                    </span>
                    <span className="text-xs">
                      ({selectedCoin.symbol.toUpperCase()})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="text-muted-foreground"
                      icon={Search01Icon}
                      size={16}
                    />
                    <span className="text-muted-foreground text-xs">
                      Search for a coin...
                    </span>
                  </div>
                )}
              </button>

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-card shadow-lg">
                  {/* Search input inside dropdown */}
                  <div className="border-input border-b p-2">
                    <InputGroup className="w-full">
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          {isSearching ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <HugeiconsIcon
                              className="text-muted-foreground"
                              icon={Search01Icon}
                              size={16}
                            />
                          )}
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        autoFocus
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search for a coin..."
                        value={searchQuery}
                      />
                    </InputGroup>
                  </div>
                  {/* Results list */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((coin) => (
                        <button
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/50"
                          key={coin.id}
                          onClick={() => handleSelectCoin(coin)}
                          type="button"
                        >
                          {coin.image && (
                            <Image
                              alt={coin.name}
                              className="rounded-full"
                              height={24}
                              src={coin.image}
                              width={24}
                            />
                          )}
                          <div className="flex flex-1 flex-col">
                            <span className="text-foreground text-sm">
                              {coin.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                {coin.symbol.toUpperCase()}
                              </span>
                              {coin.rank && (
                                <Badge
                                  className="px-1 py-0 text-[10px]"
                                  variant="secondary"
                                >
                                  #{coin.rank}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        {isSearching ? "Searching..." : "No coins found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert Type */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Alert type</Label>
            <Select
              defaultValue="price"
              items={alertTypeItems}
              onValueChange={(value) => {
                alertTypeRef.current = value as string;
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {alertTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Condition</Label>
            <Select
              defaultValue="greater_than"
              items={conditionItems}
              onValueChange={(value) => {
                conditionRef.current = value as string;
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {conditionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Threshold Value */}
          <div className="flex flex-col gap-2">
            <Label
              className="text-muted-foreground text-xs"
              htmlFor="threshold-value"
            >
              Threshold value
            </Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText className="font-medium text-primary">
                  $
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                className="text-sm"
                id="threshold-value"
                onChange={(e) => setThresholdValue(e.target.value)}
                placeholder="eg: 140"
                type="number"
                value={thresholdValue}
              />
            </InputGroup>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Frequency</Label>
            <Select
              defaultValue="once_per_day"
              items={frequencyItems}
              onValueChange={(value) => {
                frequencyRef.current = value as string;
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {frequencyItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Save Alert Button */}
          <Button onClick={handleSaveAlert}>
            {isEditMode ? "Update Alert" : "Create Alert"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlertDialog;
