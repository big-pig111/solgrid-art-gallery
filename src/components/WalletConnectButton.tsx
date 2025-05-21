
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const WalletConnectButton = () => {
  const { connected, wallet, publicKey } = useWallet();
  const [shortened, setShortened] = useState<string>("");

  useEffect(() => {
    if (publicKey) {
      const pubkeyStr = publicKey.toString();
      setShortened(`${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(-4)}`);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && wallet) {
      toast.success("钱包已连接", {
        description: `已连接到 ${wallet.adapter.name}`
      });
    }
  }, [connected, wallet]);

  return (
    <div>
      <WalletMultiButton />
    </div>
  );
};

export default WalletConnectButton;
