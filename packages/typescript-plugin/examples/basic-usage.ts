// Example: Basic TypeScript Plugin Usage
// This file demonstrates how the slug-store TypeScript plugin analyzes code

import { useSlugStore } from 'slug-store';

// 🔍 Plugin Analysis: Detects basic hook usage
function SimpleComponent() {
  // Plugin suggests: Consider enabling auto-config
  const [state, setState] = useSlugStore({ count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => setState({ count: state.count + 1 })}>
        Increment
      </button>
    </div>
  );
}

// 🔍 Plugin Analysis: Detects large state, suggests compression
function LargeStateComponent() {
  const largeInitialState = {
    products: new Array(100).fill({
      id: 'product-id',
      name: 'Product Name',
      description: 'A very long product description that repeats many times...',
      price: 99.99,
      category: 'electronics',
      tags: ['popular', 'bestseller', 'recommended']
    })
  };

  // Plugin warns: Large initial state detected (~X chars). Consider enabling compression.
  // Plugin suggests: Add { compress: true } to options
  const [products, setProducts] = useSlugStore(largeInitialState);

  return <div>Products: {products.products.length}</div>;
}

// 🔍 Plugin Analysis: Detects sensitive data, suggests encryption
function SensitiveDataComponent() {
  const sensitiveData = {
    user: {
      email: 'user@example.com',
      password: 'secret123', // 🚨 Plugin detects sensitive keyword
      creditCard: '1234-5678-9012-3456' // 🚨 Plugin detects sensitive keyword
    }
  };

  // Plugin warns: Potentially sensitive data detected. Consider enabling encryption.
  // Plugin suggests: Add { encrypt: true } to options
  const [user, setUser] = useSlugStore(sensitiveData);

  return <div>User: {user.user.email}</div>;
}

// 🔍 Plugin Analysis: Optimal configuration example
function OptimalComponent() {
  // Plugin approves: Auto-config enabled for optimal performance
  const [state, setState] = useSlugStore(
    { items: [], filters: {} },
    { autoConfig: true } // ✅ Plugin suggests this pattern
  );

  return <div>Optimized component</div>;
}

// 🔍 Plugin Analysis: Wrong import path
// Plugin error: createNextState should be imported from server, not client
// import { createNextState } from 'slug-store/client'; // ❌ Wrong!

// 🔍 Plugin Analysis: Correct import paths
// Plugin approves: Specific imports for better tree-shaking
import { createNextState } from 'slug-store/server'; // ✅ Correct!

const ProductState = createNextState({
  loader: async (id: string) => {
    // Plugin suggests: Consider enabling auto-config for server-side optimization
    return { id, name: 'Product', price: 99.99 };
  }
  // Plugin suggests: Add autoConfig: true to createNextState options
});

export {
  SimpleComponent,
  LargeStateComponent,
  SensitiveDataComponent,
  OptimalComponent,
  ProductState
}; 