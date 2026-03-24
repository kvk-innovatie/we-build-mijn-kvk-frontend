// Polyfill for wallet-connect-button-react compatibility issue
// The package expects ReactSharedInternals.recentlyCreatedOwnerStacks but it doesn't exist in React 18.3.1

import React from 'react';

console.log('🔧 Wallet polyfill loading...');

// Try multiple approaches to fix the issue
if (typeof window !== 'undefined') {
  try {
    // Method 1: Try React internals
    // @ts-ignore - Accessing React internals for compatibility
    const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    
    console.log('🔍 ReactSharedInternals available:', !!ReactSharedInternals);
    console.log('🔍 ReactSharedInternals type:', typeof ReactSharedInternals);
    
    if (ReactSharedInternals) {
      console.log('🔍 ReactSharedInternals keys:', Object.keys(ReactSharedInternals));
      console.log('🔍 Has recentlyCreatedOwnerStacks:', ReactSharedInternals.hasOwnProperty('recentlyCreatedOwnerStacks'));
      
      if (!ReactSharedInternals.hasOwnProperty('recentlyCreatedOwnerStacks')) {
        ReactSharedInternals.recentlyCreatedOwnerStacks = 0;
        console.log('✅ Method 1: Applied ReactSharedInternals.recentlyCreatedOwnerStacks polyfill');
      } else {
        console.log('ℹ️ recentlyCreatedOwnerStacks already exists:', ReactSharedInternals.recentlyCreatedOwnerStacks);
      }
    } else {
      console.error('❌ ReactSharedInternals is not available');
    }

    // Method 2: Try to patch the global React object
    // @ts-ignore
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      // @ts-ignore
      const windowReactInternals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (!windowReactInternals.hasOwnProperty('recentlyCreatedOwnerStacks')) {
        windowReactInternals.recentlyCreatedOwnerStacks = 0;
        console.log('✅ Method 2: Applied window.React polyfill');
      }
    }

    // Method 3: Try to patch any existing React modules in the global scope
    // @ts-ignore
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
      console.log('🔍 React DevTools detected, renderers:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size);
    }

  } catch (error) {
    console.error('❌ Failed to apply React polyfill:', error);
  }

  // Method 4: Try to intercept the error at runtime
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('recentlyCreatedOwnerStacks')) {
      console.log('🚨 Detected recentlyCreatedOwnerStacks error - attempting runtime fix');
      // Try to apply the fix at runtime
      try {
        // @ts-ignore
        const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (ReactSharedInternals && !ReactSharedInternals.hasOwnProperty('recentlyCreatedOwnerStacks')) {
          ReactSharedInternals.recentlyCreatedOwnerStacks = 0;
          console.log('✅ Runtime fix applied');
        }
      } catch (e) {
        console.log('❌ Runtime fix failed:', e);
      }
    }
    return originalError.apply(console, args);
  };
}

console.log('🔧 Wallet polyfill setup complete');

export {}; // Make this a module
