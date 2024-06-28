"use client"

import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

export default function UserAvatar({ pfp }: { pfp: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (pfp)
      setDataUrl(`${PINATA_GATEWAY}/ipfs/${pfp.split('://')[1]}`)
  }, [pfp]);

  return (
    <Avatar>
      <AvatarImage src={dataUrl} />
      <AvatarFallback><UserRound /></AvatarFallback>
    </Avatar>
  )
}