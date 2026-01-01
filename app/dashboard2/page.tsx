"use client";

import MarkerSummary from "@/components/dashboard/marker-summary";
import { Button } from "@/components/ui/button";

const Dashboard2Page = () => {
    return (
        <div className="p-8 flex flex-row gap-4">
            <div className="flex-1">
                <MarkerSummary />
            </div>
            <div className="flex-1">
            </div>
        </div>
    );
};

export default Dashboard2Page;
