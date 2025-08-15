/**
 * @copyright Nomaan Faruki - 2025
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Use the correct provider name as suggested by your editor
// Changed 'NhostReactProvider' to 'NhostProvider'
import { NhostClient, NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';

// Initialize the Nhost client using the secure environment variable
const nhost = new NhostClient({
  backendUrl: import.meta.env.VITE_NHOST_BACKEND_URL
});

// Render the app with the correct providers
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Changed 'NhostReactProvider' to 'NhostProvider' */}
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <App />
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>
);



// /**
//  * @copyright Nomaan Faruki - 2025
//  */

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';

// import { NhostClient, NhostProvider } from '@nhost/nextjs';
// import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, ApolloLink, split } from '@apollo/client';
// import { WebSocketLink } from '@apollo/client/link/ws';
// import { getMainDefinition } from '@apollo/client/utilities';

// // Initialize the Nhost client with your subdomain and region
// const nhost = new NhostClient({
//   subdomain: 'ndmbvkkpkvnkjgiptvny',
//   region: 'ap-south-1',
// });

// // An HTTP link for queries and mutations
// const httpLink = new HttpLink({
//   uri: nhost.graphql.url,
// });

// // A link to add the Authorization header for HTTP requests
// const authHttpLink = new ApolloLink((operation, forward) => {
//   const token = nhost.auth.getAccessToken(); // Correctly get the token here
//   if (token) {
//     operation.setContext({
//       headers: {
//         ...operation.getContext().headers,
//         authorization: `Bearer ${token}`,
//       },
//     });
//   }
//   return forward(operation);
// });

// // A WebSocket link for real-time subscriptions
// const wsLink = new WebSocketLink({
//   uri: nhost.graphql.url.replace('https://', 'wss://'),
//   options: {
//     reconnect: true,
//     connectionParams: () => {
//       const token = nhost.auth.getAccessToken(); // Correctly get the token here
//       return {
//         headers: {
//           authorization: token ? `Bearer ${token}` : '',
//         },
//       };
//     },
//   },
// });

// // Use `split` to route requests to the correct link
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   authHttpLink.concat(httpLink)
// );

// // Initialize the Apollo Client with the correct link setup
// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   link: splitLink,
// });

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <ApolloProvider client={client}>
//       <NhostProvider nhost={nhost}>
//         <App />
//       </NhostProvider>
//     </ApolloProvider>
//   </React.StrictMode>,
// );

