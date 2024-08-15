/** Make sure pinata gateway is provided */
if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
  console.log("You haven't setup your NEXT_PUBLIC_PINATA_GATEWAY yet.")
}

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
