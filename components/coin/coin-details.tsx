"use client";

import {
  Copy01Icon,
  GlobeIcon,
  LegalDocument01Icon,
  NewTwitterIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "../ui/badge";

interface CoinDetailsProps {
  coinData: CoinData | null;
}

interface CoinData {
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    repos_url: {
      github: string[];
    };
    whitepaper: string;
    blockchain_site: string[];
  };
  contract_address: string;
  categories: string[];
  market_cap_rank: number;
}

const EmptyCard = () => (
  <Card className="h-full overflow-y-scroll">
    <CardHeader />
    <CardContent />
  </Card>
);

const truncateAddress = (address: string) => {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 12)}...${address.slice(-6)}`;
};

const cleanDescription = (html: string) => {
  return html.replace(/<[^>]*>/g, "");
};

const CoinHeader = ({ coinData }: { coinData: CoinData }) => {
  const { name, symbol, image, market_cap_rank } = coinData;

  return (
    <div className="flex items-center gap-3">
      {image?.large && (
        <Image
          alt={name}
          className="rounded-full"
          height={32}
          src={image.large}
          width={32}
        />
      )}
      <div>
        <h1 className="overflow-hidden truncate font-semibold text-base">
          {name}
        </h1>
        <span className="text-muted-foreground text-xs uppercase">
          {symbol}
        </span>
      </div>
      {market_cap_rank && <Badge>Rank #{market_cap_rank}</Badge>}
    </div>
  );
};

const CoinDescription = ({
  descriptionText,
  expanded,
  name,
  onKeyPress,
  onToggle,
}: {
  name: string;
  descriptionText: string;
  expanded: boolean;
  onToggle: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}) => {
  const truncatedDescription =
    descriptionText.length > 150
      ? `${descriptionText.substring(0, 150)}...`
      : descriptionText;

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-muted-foreground text-xs">
        About {name}
      </h3>
      <p className="text-foreground/90 text-xs leading-relaxed">
        {expanded
          ? cleanDescription(descriptionText)
          : cleanDescription(truncatedDescription)}
      </p>
      {descriptionText.length > 150 && (
        <button
          aria-expanded={expanded}
          className="text-primary text-xs hover:underline"
          onClick={onToggle}
          onKeyDown={onKeyPress}
          type="button"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

const CoinContractAddress = ({
  contract_address,
  copied,
  onCopy,
  onKeyPress,
}: {
  contract_address: string;
  copied: boolean;
  onCopy: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}) => (
  <div className="space-y-2">
    <h3 className="font-medium text-muted-foreground text-sm">
      Contract Address
    </h3>
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1 px-2">
      <code className="flex-1 font-mono text-xs">
        {truncateAddress(contract_address)}
      </code>
      <button
        aria-label={copied ? "Copied!" : "Copy contract address"}
        className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-muted"
        onClick={onCopy}
        onKeyDown={onKeyPress}
        title="Copy address"
        type="button"
      >
        {copied ? (
          <HugeiconsIcon
            className="text-green-500"
            icon={Tick02Icon}
            size={16}
          />
        ) : (
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={Copy01Icon}
            size={16}
          />
        )}
      </button>
    </div>
  </div>
);

const CoinCategories = ({ categories }: { categories: string[] }) => (
  <div className="space-y-2">
    <h3 className="font-medium text-muted-foreground text-sm">Categories</h3>
    <div className="flex flex-wrap gap-2">
      {categories.slice(0, 3).map((category: string) => (
        <span
          className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground text-xs"
          key={category}
        >
          {category}
        </span>
      ))}
      {categories.length > 3 && (
        <span className="px-2 py-1 text-muted-foreground text-xs">
          +{categories.length - 3} more
        </span>
      )}
    </div>
  </div>
);

const CoinLinks = ({ links }: { links: CoinData["links"] }) => {
  const homepage = links?.homepage?.[0] || "";
  const twitterHandle = links?.twitter_screen_name || "";
  const whitepaper = links?.whitepaper || "";

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-muted-foreground text-sm">Links</h3>
      <div className="flex flex-wrap gap-2">
        {homepage && (
          <Link
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
            href={homepage}
            target="_blank"
          >
            <HugeiconsIcon icon={GlobeIcon} size={16} />
            Website
          </Link>
        )}
        {twitterHandle && (
          <Link
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs transition-colors hover:bg-muted"
            href={`https://twitter.com/${twitterHandle}`}
            target="_blank"
          >
            <HugeiconsIcon icon={NewTwitterIcon} size={16} />
            Twitter
          </Link>
        )}
        {whitepaper && (
          <Link
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs transition-colors hover:bg-muted"
            href={whitepaper}
            target="_blank"
          >
            <HugeiconsIcon icon={LegalDocument01Icon} size={16} />
            Whitepaper
          </Link>
        )}
      </div>
    </div>
  );
};

const CoinDetails = ({ coinData }: CoinDetailsProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Helper for keyboard navigation
  const handleKeyPress = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  if (!coinData) {
    return <EmptyCard />;
  }

  const { name, description, links, contract_address, categories } = coinData;

  const descriptionText = description?.en || "";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers or when clipboard API is not available
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Card className="h-full overflow-y-scroll">
      <CardHeader>
        <CoinHeader coinData={coinData} />
      </CardHeader>
      <CardContent className="space-y-6">
        <CoinDescription
          descriptionText={descriptionText}
          expanded={expanded}
          name={name}
          onKeyPress={handleKeyPress(() => setExpanded(!expanded))}
          onToggle={() => setExpanded(!expanded)}
        />
        {contract_address && (
          <CoinContractAddress
            contract_address={contract_address}
            copied={copied}
            onCopy={() => copyToClipboard(contract_address)}
            onKeyPress={handleKeyPress(() => copyToClipboard(contract_address))}
          />
        )}
        {categories && categories.length > 0 && (
          <CoinCategories categories={categories} />
        )}
        <CoinLinks links={links} />
      </CardContent>
    </Card>
  );
};

export default CoinDetails;
