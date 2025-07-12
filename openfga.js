import { OpenFgaClient } from '@openfga/sdk';

export const fgaClient = new OpenFgaClient({
  apiUrl: 'http://localhost:8080', // required
  storeId: '01JZ5TSS3V5DA72AA18CDSF1H1', // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: '01JZ5TWFBQK8XXSAFAY4FCZYXK', // Optional, can be overridden per request
});
