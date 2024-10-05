# To deploy new schema 
## TODO: write down the steps to deploy the latest schema to ceramic mainnet
### TODO: re-create all categories (const/categories.ts) in updated schema and clone the stream ids here

## Create default topics 
repeat the mutation below to create all default categories (refer to `const/categories.ts`)
```
mutation MyMutation {
  createTopic(
    input: {content: {
      name: "Business Development & Strategy", 
      slug: "business_development_and_strategy", 
      createdAt: "2024-08-11T08:56:16.174Z"}}
  ) {
    document {
      slug
    }
  }
}
```