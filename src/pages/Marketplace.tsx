
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface GridItem {
  id: string;
  grid_number: number;
  price: number;
  owner: string | null;
  image_url: string | null;
}

const Marketplace = () => {
  const { connected, publicKey } = useWallet();
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 从Supabase加载未售出的网格数据
  useEffect(() => {
    const loadAvailableGrids = async () => {
      try {
        const { data, error } = await supabase
          .from('grids')
          .select('*')
          .is('owner', null)
          .order('grid_number', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setGrid(data as GridItem[]);
      } catch (error) {
        console.error('加载市场数据出错:', error);
        toast.error('加载市场数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadAvailableGrids();
  }, []);

  const handlePurchase = async (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    // 显示处理中提示
    toast.promise(
      (async () => {
        // 更新数据库
        const { error } = await supabase
          .from('grids')
          .update({ owner: publicKey?.toString() })
          .eq('id', item.id);
          
        if (error) {
          throw error;
        }
        
        // 从可用网格列表中移除
        setGrid(grid.filter(g => g.id !== item.id));
        
        return true;
      })(),
      {
        loading: "正在处理交易...",
        success: `成功购买网格 #${item.grid_number + 1}`,
        error: "交易失败，请重试"
      }
    );
  };
  
  const filterOptions = ["全部", "价格: 低到高", "价格: 高到低"];
  const [activeFilter, setActiveFilter] = useState("全部");

  // 处理筛选
  const handleFilter = (option: string) => {
    setActiveFilter(option);
    
    let sortedGrid = [...grid];
    if (option === "价格: 低到高") {
      sortedGrid.sort((a, b) => a.price - b.price);
    } else if (option === "价格: 高到低") {
      sortedGrid.sort((a, b) => b.price - a.price);
    } else {
      // "全部" 按网格编号排序
      sortedGrid.sort((a, b) => a.grid_number - b.grid_number);
    }
    
    setGrid(sortedGrid);
  };

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
            onClick={() => handleFilter(option)}
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
                  <CardTitle className="text-lg">网格 #{item.grid_number + 1}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="aspect-square bg-secondary rounded-md flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-radial from-sol/30 to-transparent flex items-center justify-center">
                      <span className="font-bold text-xl">{item.grid_number + 1}</span>
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
