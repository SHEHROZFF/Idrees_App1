// src/App.js

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator'; // Import your navigation setup
// import 'nativewind/tailwind.css'; // Import the Tailwind styles
import { CartProvider } from './src/contexts/CartContext';
import { FavouritesProvider } from './src/contexts/FavouritesContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { UserProvider as UserContextProvider } from './src/contexts/UserContext';
import { PUBLISH_STRIPE_KEY } from '@env';


const App = () => {
console.log(PUBLISH_STRIPE_KEY);
  return (
    < StripeProvider publishableKey='pk_live_51QUJTeAYX90dZcYhXxLMV9CXUd8UEKTLSuyGrSoOMvnoMjkKAi6xYM0qnG498Drp1pRVGMyiWUsuR3AJOBowQ2LX00hmlBlDcx' >
     <UserContextProvider>
      <FavouritesProvider>
          <CartProvider>
              <AppNavigator />
          </CartProvider>
        </FavouritesProvider>
      </UserContextProvider>
    </StripeProvider >
  );
};

export default App;




// // src/App.js

// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator'; // Import your navigation setup
// // import 'nativewind/tailwind.css'; // Import the Tailwind styles
// import { CartProvider } from './src/contexts/CartContext';
// import { FavouritesProvider } from './src/contexts/FavouritesContext';
// import { UserProvider as UserContextProvider } from './src/contexts/UserContext';


// const App = () => {
//   return (
//     <UserContextProvider>
//       <FavouritesProvider>
//         <CartProvider>
//             <AppNavigator />
//         </CartProvider>
//       </FavouritesProvider>
//     </UserContextProvider>

//   );
// };

// export default App;
