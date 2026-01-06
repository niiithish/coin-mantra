import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ReviewCard = () => {
  return (
    <Card className="w-[600px] bg-transparent ring-0">
      <CardContent>
        <p className="font-medium text-lg">
          CoinWatch turned my watchlist into a winning list. The alerts are
          spot-on, and I feel more confident making moves in the market
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="font-semibold text-base">— No one :)</p>
            <p className="text-sm">Retail Investor</p>
          </div>
          <div className="flex items-center">
            <HugeiconsIcon
              color={"var(--primary)"}
              fill="var(--primary)"
              icon={StarIcon}
              size={16}
            />
            <HugeiconsIcon
              color={"var(--primary)"}
              fill="var(--primary)"
              icon={StarIcon}
              size={16}
            />
            <HugeiconsIcon
              color={"var(--primary)"}
              fill="var(--primary)"
              icon={StarIcon}
              size={16}
            />
            <HugeiconsIcon
              color={"var(--primary)"}
              fill="var(--primary)"
              icon={StarIcon}
              size={16}
            />
            <HugeiconsIcon
              color={"var(--primary)"}
              fill="var(--primary)"
              icon={StarIcon}
              size={16}
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReviewCard;
