import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";
import dotenv from "dotenv";

dotenv.config();

export const fgaClient = new OpenFgaClient({
  apiUrl: "https://api.us1.fga.dev",
  storeId: process.env.OPENFGA_STORE_ID || "01K7J9DP684XA6AMNN4W7S13VQ",
  authorizationModelId:
    process.env.OPENFGA_MODEL_ID || "01K7JC0WN3R3KSDQHWRKKG816M",
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: "auth.fga.dev",
      apiAudience: "https://api.us1.fga.dev/",
      clientId:
        process.env.OPENFGA_CLIENT_ID || "wueRYzVYDtzmx2tCQPmjkIF3iFq8oa2J",
      clientSecret:
        process.env.OPENFGA_API_TOKEN ||
        "tf4iTMokz0yJJuP4IRYSZzcB5KDilT4XD87emLZVPqynoq2520UqamyqvgA2DQXu",
    },
  },
});
