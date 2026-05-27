import React from "react";
import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 rounded-full p-4">
            <GraduationCap className="h-10 w-10 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-indigo-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
