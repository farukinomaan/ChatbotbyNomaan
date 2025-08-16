/**
 * @copyright Nomaan Faruki - 2025
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { NhostClient, NhostProvider } from '@nhost/nextjs';
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, ApolloLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';


const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN || 'ndmbvkkpkvnkjgiptvny';
const region = import.meta.env.VITE_NHOST_REGION || 'ap-south-1';

console.log('🔍 Nhost Configuration:');
console.log('Subdomain:', subdomain);
console.log('Region:', region);
console.log('Environment mode:', import.meta.env.MODE);

// Initialize the Nhost client with your subdomain and region
const nhost = new NhostClient({
  subdomain: subdomain,
  region: region,
});

console.log('✅ Nhost client initialized');
console.log('GraphQL URL:', nhost.graphql.url);

// An HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: nhost.graphql.url,
});

// A link to add the Authorization header for HTTP requests
const authHttpLink = new ApolloLink((operation, forward) => {
  const token = nhost.auth.getAccessToken(); // Correctly get the token here
  if (token) {
    operation.setContext({
      headers: {
        ...operation.getContext().headers,
        authorization: `Bearer ${token}`,
      },
    });
  }
  return forward(operation);
});


const wsLink = new WebSocketLink({
  uri: nhost.graphql.url.replace('https://', 'wss://'),
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = nhost.auth.getAccessToken(); 
      return {
        headers: {
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
  },
  wsLink,
  authHttpLink.concat(httpLink)
);


const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

console.log('✅ Apollo Client initialized');
console.log('🚀 Rendering app...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <NhostProvider nhost={nhost}>
        <App />
      </NhostProvider>
    </ApolloProvider>
  </React.StrictMode>,
);