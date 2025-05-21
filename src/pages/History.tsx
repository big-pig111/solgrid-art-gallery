
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Transaction {
  id: string;
  gridId: number;
  price: number;
  timestamp: Date;
  txId: string;
}

const History = () => {
  const { connected, publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (connected && publicKey) {
      // Simulate loading data
      setTimeout(() => {
        const mockTransactions: Transaction[] = Array(5).fill(null).map((_, i) => ({
          id: `tx-${i}`,
          gridId: Math.floor(Math.random() * 100),
          price: 0.05,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)),
          txId: `${Array(8).fill(0).map(() => Math.random().toString(36).substring(2, 10)).join('')}`,
        }));
        
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold mb-4">请连接钱包查看购买记录</h2>
        <p className="text-muted-foreground mb-6">您需要连接钱包来查看您的交易历史。</p>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const handleViewOnSolscan = (txId: string) => {
    // In a real app, this would link to the actual transaction on Solscan
    toast.info("正在重定向到 Solscan", {
      description: `交易 ID: ${shortenAddress(txId)}`
    });
    window.open(`https://solscan.io/tx/${txId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">购买记录</h1>
        <p className="text-muted-foreground">
          查看您的所有网格购买交易历史。
        </p>
      </div>
      
      <Card className="border-border p-6">
        <h2 className="text-xl font-semibold mb-4">交易历史</h2>
        
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-border p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">购买网格 #{tx.gridId + 1}</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                  </div>
                  <span className="text-sol-light font-bold">{tx.price} SOL</span>
                </div>
                <Separator className="my-2 bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    交易 ID: {shortenAddress(tx.txId)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOnSolscan(tx.txId)}
                  >
                    在 Solscan 上查看
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">暂无交易记录</h3>
            <p className="text-muted-foreground mb-6">您还没有购买任何网格。</p>
            <Button 
              variant="default" 
              className="bg-sol hover:bg-sol-dark"
              onClick={() => window.location.href = "/marketplace"}
            >
              去市场看看
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default History;
