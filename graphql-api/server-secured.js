require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { ApolloServerPluginLandingPageLocalDefault } = require("@apollo/server/plugin/landingPage/default");
const cors = require("cors");
const bodyParser = require("body-parser");

const resolvers = require("./resolvers");
const { graphqlAuthenticate: authenticate } = require("../shared/middleware/auth");
const { connectDB } = require("../shared/data/db");
const { CustomString, CustomID, CustomInt, CustomFloat, Quantity, Price } = require("./schema/customScalars");
const { costDirectiveTransformer, listDirectiveTransformer } = require("./schema/directives");

// Load GraphQL SDL schema
const typeDefs = fs.readFileSync("./schema/schema-secured.graphql", "utf8");

const app = express();
const PORT = process.env.SECURED_PORT || 4001;

// Connect to Database
connectDB();

// Create executable schema with custom scalars
let schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    ...resolvers,
    // Add custom scalar resolvers
    CustomString,
    CustomID,
    CustomInt,
    CustomFloat,
    Quantity,
    Price,
  },
});

// Apply directive transformers
schema = costDirectiveTransformer(schema);
schema = listDirectiveTransformer(schema);

// Create Apollo Server with secured schema
const server = new ApolloServer({
  schema,
  formatError: (error) => {
    // Log errors but expose them for demonstration purposes
    console.error("GraphQL Error:", error);
    return error;
  },
  introspection: true, // Enable introspection for demo/comparison purposes
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }), // Embedded GraphiQL playground
  ],
  // Query complexity limits
  validationRules: [
    // Add query complexity validation here if using graphql-query-complexity
  ],
});

// Start Apollo Server and apply middleware
const startServer = async () => {
  await server.start();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // GraphQL endpoint with authentication context
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Authenticate user and add to context
        const user = await authenticate(req);
        return { user };
      },
    })
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "telco-graphql-api-secured", security: "hardened" });
  });

  // Load SSL Certificates
  const certPath = process.env.CERT_PATH || "../shared/certs";
  const sslOptions = {
    key: fs.readFileSync(`${certPath}/key.pem`),
    cert: fs.readFileSync(`${certPath}/cert.pem`),
  };

  // Start HTTPS Server
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🔒 Secured GraphQL Server running on https://localhost:${PORT}/graphql`);
    console.log(`📊 Health check available at https://localhost:${PORT}/health`);
    console.log(`🛡️  Security features:`);
    console.log(`   ✅ Custom scalar validation`);
    console.log(`   ✅ List size constraints (@list directive)`);
    console.log(`   ✅ Query complexity tracking (@cost directive)`);
    console.log(`   ✅ Introspection enabled (embedded playground available)`);
    console.log(`   ⚠️  Vulnerabilities preserved at resolver level for demo`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start secured server:", err);
  process.exit(1);
});
