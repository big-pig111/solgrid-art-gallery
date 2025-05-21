
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface GridItem {
  id: string;
  grid_number: number;
  price: number;
  owner: string | null;
  image_url: string | null;
}

const Index = () => {
  const { connected, publicKey } = useWallet();
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  
  // 从Supabase加载网格数据
  useEffect(() => {
    const loadGridData = async () => {
      try {
        setLoading(true);
        
        // 从Supabase获取网格数据
        const { data, error } = await supabase
          .from('grids')
          .select('*')
          .order('grid_number', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // 如果有数据，使用数据库中的数据
          setGrid(data as GridItem[]);
        } else {
          // 如果没有数据，初始化网格并插入到数据库
          const initialGrid: Omit<GridItem, 'id'>[] = [];
          for (let i = 0; i < 100; i++) {
            initialGrid.push({
              grid_number: i,
              price: 0.05,
              owner: null,
              image_url: null,
            });
          }
          
          // 批量插入初始网格数据
          const { error: insertError } = await supabase
            .from('grids')
            .insert(initialGrid);
            
          if (insertError) {
            throw insertError;
          }
          
          // 重新获取插入的数据
          const { data: newData } = await supabase
            .from('grids')
            .select('*')
            .order('grid_number', { ascending: true });
            
          setGrid(newData as GridItem[]);
        }
      } catch (error) {
        console.error('加载网格数据出错:', error);
        toast.error('加载网格数据失败');
        
        // 如果加载失败，使用本地初始化的数据
        const fallbackGrid: GridItem[] = [];
        for (let i = 0; i < 100; i++) {
          fallbackGrid.push({
            id: i.toString(),
            grid_number: i,
            price: 0.05,
            owner: null,
            image_url: null,
          });
        }
        setGrid(fallbackGrid);
      } finally {
        setLoading(false);
      }
    };
    
    loadGridData();
  }, []);

  const handlePurchase = async (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    setLoading(true);
    
    try {
      // 更新Supabase中的网格数据
      const { error } = await supabase
        .from('grids')
        .update({ 
          owner: publicKey?.toString() 
        })
        .eq('id', item.id);
        
      if (error) {
        throw error;
      }
      
      // 更新本地状态
      const newGrid = [...grid];
      const index = newGrid.findIndex((g) => g.id === item.id);
      
      if (index !== -1) {
        newGrid[index] = {
          ...newGrid[index],
          owner: publicKey?.toString() || null,
        };
        
        setGrid(newGrid);
        setPurchaseCount(prev => prev + 1);
        
        // 价格上涨逻辑
        if ((purchaseCount + 1) % 10 === 0) {
          // 更新所有未购买网格的价格
          const idsToUpdate = newGrid
            .filter(g => !g.owner)
            .map(g => g.id);
          
          if (idsToUpdate.length > 0) {
            // 批量更新价格
            const { error: priceUpdateError } = await supabase
              .from('grids')
              .update({ price: item.price * 1.75 })
              .in('id', idsToUpdate);
              
            if (priceUpdateError) {
              console.error('更新价格出错:', priceUpdateError);
            } else {
              // 更新本地状态
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
          }
        }
        
        toast.success("购买成功", {
          description: `您已购买网格 #${item.grid_number + 1}`
        });
      }
    } catch (error) {
      console.error('购买网格出错:', error);
      toast.error('购买失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (item: GridItem) => {
    if (!connected) {
      toast.error("请先连接钱包");
      return;
    }
    
    if (!item.owner || item.owner !== publicKey?.toString()) {
      toast.error("您不是该网格的所有者");
      return;
    }
    
    // 创建文件输入
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // 显示上传中提示
          const toastId = toast.loading("正在上传图片...");
          
          // 生成唯一的文件名：网格ID + 时间戳 + 文件扩展名
          const fileExt = file.name.split('.').pop();
          const fileName = `${item.id}_${Date.now()}.${fileExt}`;
          const filePath = `grid_${item.grid_number}/${fileName}`;
          
          // 上传文件到Supabase存储
          const { error: uploadError, data } = await supabase
            .storage
            .from('grid_images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error("上传错误:", uploadError);
            throw uploadError;
          }
          
          // 获取公共URL
          const { data: { publicUrl } } = supabase
            .storage
            .from('grid_images')
            .getPublicUrl(filePath);
            
          // 更新数据库中的图片URL
          const { error: updateError } = await supabase
            .from('grids')
            .update({ image_url: publicUrl })
            .eq('id', item.id);
            
          if (updateError) {
            console.error("更新数据库错误:", updateError);
            throw updateError;
          }
          
          // 更新本地状态
          setGrid(grid.map(g => {
            if (g.id === item.id) {
              return { ...g, image_url: publicUrl };
            }
            return g;
          }));
          
          toast.dismiss(toastId);
          toast.success("图片上传成功");
        } catch (error) {
          console.error('上传图片出错:', error);
          toast.error('上传图片失败，请重试');
        }
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
                style={{
                  aspectRatio: "1/1",
                  width: "100%",
                  height: "auto",
                  border: "1px solid #ccc",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={`Grid ${item.grid_number}`}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-1">
                  <p className="text-xs font-medium text-center mb-1 text-white">
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
                      className="w-full text-xs h-7 mt-1 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => handleImageUpload(item)}
                    >
                      上传图片
                    </Button>
                  )}
                </div>
                
                {item.owner && !item.image_url && (
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
