export async function POST(request: Request) {
  console.log("uploadMedia to IPFS with ipfs/upload/route.ts - ", request)

  /** Making sure user has setup its Pinata keys */
  if (!process.env.PINATA_API_KEY) {
    console.log("You haven't setup your PINATA_API_KEY yet.")
    return new Response("You haven't setup your PINATA_API_KEY yet.", {
      status: 300,
    })
  }

  if (!process.env.PINATA_SECRET_API_KEY) {
    console.log("You haven't setup your PINATA_SECRET_API_KEY yet.")
    return new Response("You haven't setup your PINATA_SECRET_API_KEY yet.", {
      status: 300,
    })
  }

  try {
    const formData = await request.formData()
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
      },
      body: formData
    })
    const data = await res.json()
    console.log({ data })

    if (res.status == 200) {
      return Response.json({
        url: "ipfs://" + data.IpfsHash,
        gateway: process.env.PINATA_GATEWAY
      })
    } else {
      return new Response(data?.error?.details ? data.error.details : 'Error uploading media', {
        status: 500,
      })
    }
  } catch (error) {
    console.log('Error uploading media: ', error)
    return new Response('Error uploading media', {
      status: 300,
    })
  }

}