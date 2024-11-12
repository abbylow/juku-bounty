"use client"

import { UserRound } from 'lucide-react';
import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PINATA_GATEWAY } from '@/lib/pinata-gateway';

interface UserAvatarProps extends ComponentPropsWithoutRef<'div'> {
  pfp?: string;
}

export default function UserAvatar({ pfp, ...props }: UserAvatarProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (pfp)
      setDataUrl(`${PINATA_GATEWAY}/ipfs/${pfp.split('://')[1]}`)
  }, [pfp]);

  if (!pfp) {
    return (
      <Avatar {...props}>
        <AvatarFallback><UserRound /></AvatarFallback>
      </Avatar>
    )
  }
  return (
    <Avatar {...props}>
      <AvatarImage src={dataUrl} />
      <AvatarFallback><UserRound /></AvatarFallback>
    </Avatar>
  )
}