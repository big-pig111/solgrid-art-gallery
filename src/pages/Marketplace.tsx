
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface GridItem {
  id: number;
  price: number;
  owner: string | null;
  image: string | null;
}

const Marketplace = () => {
  const { connected, publicKey } = useWallet();
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize grid (in a real app, we'd fetch from blockchain)
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const initialGrid: GridItem[] = [];
      for (let i = 0; i < 100; i++) {
        initialGrid.push({
          id: i,
          price: 0.05,
          owner: Math.random() > 0.7 ? "dummy_address" : null,
          image: Math.random() > 0.8 ? "https://picsum.photos/200" : null,
        });
      }
      setGrid(initialGrid.filter(item => !item.owner)); // Only show available plots
      setLoading(false);
    }, 1500);
  }, []);

  const handlePurchase = (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    // Simulate transaction
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: "正在处理交易...",
        success: `成功购买网格 #${item.id + 1}`,
        error: "交易失败，请重试"
      }
    );
    
    // Remove from available grid
    setGrid(grid.filter(g => g.id !== item.id));
  };
  
  const filterOptions = ["全部", "价格: 低到高", "价格: 高到低"];
  const [activeFilter, setActiveFilter] = useState("全部");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">市场</h1>
        <p className="text-muted-foreground">
          浏览并购买可用的网格。
        </p>
      </div>
      
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {filterOptions.map(option => (
          <Button
            key={option}
            variant={activeFilter === option ? "default" : "outline"}
            className={`${activeFilter === option ? "bg-sol hover:bg-sol-dark" : ""}`}
            onClick={() => setActiveFilter(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grid.length > 0 ? (
            grid.map(item => (
              <Card key={item.id} className="border-border overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">网格 #{item.id + 1}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="aspect-square bg-secondary rounded-md flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-radial from-sol/30 to-transparent flex items-center justify-center">
                      <span className="font-bold text-xl">{item.id + 1}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-medium">价格:</span>
                    <span className="text-sol-light font-bold">{item.price} SOL</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-sol hover:bg-sol-dark"
                    onClick={() => handlePurchase(item)}
                    disabled={!connected}
                  >
                    {connected ? "购买" : "请先连接钱包"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">暂无可用网格</h3>
              <p className="text-muted-foreground">所有网格已售出或当前没有网格可供购买。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
