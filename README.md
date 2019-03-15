# GraphQL Apollo Example

## Setup

```bash
yarn install
```

## Develop

```bash
yarn start
# then visit http://localhost:4000
```

## Queries to Try

```graphql
query getNestedRelationships {
  organization(id: "123") {
    name
    users {
      name
      organization {
        name
      }
    }
  }
}

# Set authorization header first
# { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiYyIsImlhdCI6MTUzMjQ1NDE4MH0.U2IXOLpKqcPLCtzIasl_U8cK_I5tDMAW_CPN5szzhwA" }
query getRestrictedDadJoke {
  tellMeADadJoke
}

mutation {
  signup(organization: "123", id: "newUserId", name: "Tyler Buchea") {
    name
  }
}

query login {
  login(username: "Elon Musk")
}
```
