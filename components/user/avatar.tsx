import { AvatarIcon } from '@radix-ui/react-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// TODO: get user profile and pfp from DID
export default function UserAvatar() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback><AvatarIcon /></AvatarFallback>
    </Avatar>
  )
}