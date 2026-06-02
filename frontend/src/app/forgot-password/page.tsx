"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import apiClient from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  phone: z.string().min(10, "Enter a valid phone number").max(15),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { phone: data.phone });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not process your request. Please contact your administrator.";
      toast({ title: "Request Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-indigo-100 rounded-full p-3">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your phone number and we&apos;ll send an SMS with reset instructions.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium text-gray-900">Request Sent</p>
                <p className="text-sm text-gray-500">
                  If an account exists for that number, you will receive an SMS
                  shortly with instructions to reset your password.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/login">Return to Login</Link>
                </Button>
              </div>
            ) : (
              <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0244 123 456"
                    autoComplete="tel"
                    maxLength={15}
                    pattern="[0-9]{10,15}"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>

                <p className="text-xs text-center text-gray-400 pt-1">
                  Can&apos;t access your phone?{" "}
                  <a href="mailto:info@fransgiddy.edu.gh" className="text-indigo-600 hover:underline">
                    Contact an administrator
                  </a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
