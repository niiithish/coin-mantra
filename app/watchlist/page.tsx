import AlertList from "@/components/watchlist/alert-list";
import WatchlistNews from "@/components/watchlist/watchlist-news";
import WatchlistTable from "@/components/watchlist/watchlist-table";

const WatchlistPage = () => {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex h-full max-h-[80vh] min-h-[80vh] flex-row gap-10">
        <div className="flex w-full flex-3">
          <WatchlistTable />
        </div>
        <div className="flex w-full flex-1">
          <AlertList />
        </div>
      </div>
      <div className="flex w-full flex-1">
        <WatchlistNews />
      </div>
    </div>
  );
};

export default WatchlistPage;
