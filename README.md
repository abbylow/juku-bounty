This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Ceramic Data Modeling 
### Define models 
Create schema in grapgql, eg: composites/schema.graphql
### Generate composite

`composedb composite:create schema.graphql --output=composite.json --did-private-key=[ADMIN_KEY]`

### Deploy composite
`composedb composite:deploy composite.json --ceramic-url=http://localhost:7007 --did-private-key=[ADMIN_KEY]`
#### Examples of deployed composites: 
["kjzl6hvfrbw6cb1xctc6896v8id5qnmcdg0biqaez3yuytrsgpjaa0czc32bdgn","kjzl6hvfrbw6c7zk4c0rksxamnpnaimwnpgyme24cfd3q0gmba5km2tzkns4dfi"]

### Compile composite 
`composedb composite:compile composite.json runtime-composite.json`

### Run graphql server
`composedb graphql:server --ceramic-url=http://localhost:7007 --graphiql runtime-composite.json --did-private-key=[ADMIN_KEY] --port=5005`

