import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import Loader from "./components/Loader"; // Import the Loader component

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
