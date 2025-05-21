
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface GridItem {
  id: number;
  price: number;
  owner: string | null;
  image: string | null;
}

const Index = () => {
  const { connected, publicKey } = useWallet();
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  
  // Initialize grid
  useEffect(() => {
    const initialGrid: GridItem[] = [];
    for (let i = 0; i < 100; i++) {
      initialGrid.push({
        id: i,
        price: 0.05,
        owner: null,
        image: null,
      });
    }
    setGrid(initialGrid);
    
    // In a real app, we would fetch this data from the blockchain
    // This is just a placeholder
  }, []);

  const handlePurchase = (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    setLoading(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      const newGrid = [...grid];
      const index = newGrid.findIndex((g) => g.id === item.id);
      
      if (index !== -1) {
        newGrid[index] = {
          ...newGrid[index],
          owner: publicKey?.toString() || null,
        };
        
        setGrid(newGrid);
        setPurchaseCount(prev => prev + 1);
        
        // Increase price every 10 purchases
        if ((purchaseCount + 1) % 10 === 0) {
          const updatedGrid = newGrid.map(g => {
            if (!g.owner) {
              return {
                ...g,
                price: g.price * 1.75
              };
            }
            return g;
          });
          setGrid(updatedGrid);
          toast.info("价格已上涨", {
            description: "每10个网格被第一次购买后，初始价格上涨75%"
          });
        }
        
        toast.success("购买成功", {
          description: `您已购买网格 #${item.id + 1}`
        });
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleImageUpload = (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    if (!item.owner || item.owner !== publicKey?.toString()) {
      toast.error("您不是该网格的所有者");
      return;
    }
    
    // In a real app, we would upload the image to a server
    // For now, we'll just simulate it
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newGrid = [...grid];
          const index = newGrid.findIndex((g) => g.id === item.id);
          
          if (index !== -1) {
            newGrid[index] = {
              ...newGrid[index],
              image: event.target?.result as string,
            };
            
            setGrid(newGrid);
            toast.success("图片上传成功");
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">网格市场</h1>
        <p className="text-muted-foreground">
          购买网格，上传图片。每个网格初始价格为 0.05 SOL。
        </p>
      </div>
      
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-10 w-full max-w-3xl mx-auto gap-1">
            {grid.map((item) => (
              <div
                key={item.id}
                className={`${
                  item.owner ? "grid-item-owned" : "grid-item"
                } relative group`}
              >
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={`Grid ${item.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-1">
                  <p className="text-xs font-medium text-center mb-1">
                    {item.owner 
                      ? "已拥有" 
                      : `${item.price} SOL`}
                  </p>
                  
                  {!item.owner && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-xs h-7 bg-sol hover:bg-sol-dark"
                      onClick={() => handlePurchase(item)}
                      disabled={loading}
                    >
                      购买
                    </Button>
                  )}
                  
                  {item.owner === publicKey?.toString() && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7 mt-1"
                      onClick={() => handleImageUpload(item)}
                    >
                      上传图片
                    </Button>
                  )}
                </div>
                
                {item.owner && !item.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-sol animate-pulse-light"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 bg-secondary p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">如何使用</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>连接你的 Phantom 钱包</li>
          <li>选择一个未被拥有的网格进行购买</li>
          <li>支付相应的 SOL 完成购买</li>
          <li>在你拥有的网格上上传你喜欢的图片</li>
        </ol>
      </div>
    </div>
  );
};

export default Index;
