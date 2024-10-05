import { Copy } from 'lucide-react';
import React from 'react';

import { useClipboard } from '@/hooks/useClipboard';

interface WalletAddressProps {
  address: string;
  className?: string;
}

const WalletAddress: React.FC<WalletAddressProps> = ({ address, className = '' }) => {
  const truncateAddress = (address: string) => {
    if (address.length > 8) {
      return `${address.slice(0, 4)}....${address.slice(-4)}`;
    }
    return address;
  };

  const { copy } = useClipboard({ timeout: 1000 });
  const copyAddress = () => {
    copy(address, "Successfully copied address.");
  }

  return (
    <div className="flex items-center gap-2">
      <p className={`md:hidden block ${className}`}>
        {truncateAddress(address)}
      </p>
      <p className={`md:block hidden ${className}`}>
        {address}
      </p>
      <Copy className="w-4 h-4" onClick={copyAddress} />
    </div>
  );
};

export default WalletAddress;
