import React from "react";
import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-ink rounded-full p-4">
            <GraduationCap className="h-10 w-10 text-ink" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-ink mb-2">404</h1>
        <h2 className="text-xl font-bold text-ink mb-3">
          Page Not Found
        </h2>
        <p className="text-ash mb-8">
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
