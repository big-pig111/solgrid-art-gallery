
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import WalletConnectButton from "./WalletConnectButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: "主页", path: "/" },
    { name: "市场", path: "/marketplace" },
    { name: "购买记录", path: "/history" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sol to-sol-dark rounded-md"></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sol to-sol-light">
              SOL网格
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-sol ${
                  location.pathname === item.path ? "text-sol" : "text-foreground/70"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center">
            <WalletConnectButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} SOL网格. 版权所有.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
