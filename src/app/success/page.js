"use client";

import { Suspense } from "react";
import OrderDetails from "./OrderDetails";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading order details...</div>
        </div>
      }
    >
      <OrderDetails />
    </Suspense>
  );
}
