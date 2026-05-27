"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registrationApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  parentName: z.string().min(2, "Parent name is required"),
  parentEmail: z.string().email("Please enter a valid email"),
  parentPhone: z.string().min(7, "Phone number is required"),
  childFirstName: z.string().min(1, "Child's first name is required"),
  childLastName: z.string().min(1, "Child's last name is required"),
  childDateOfBirth: z.string().min(1, "Date of birth is required"),
  desiredClass: z.string().min(1, "Desired class is required"),
  message: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      await registrationApi.submit({
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        parentPhone: data.parentPhone,
        childFirstName: data.childFirstName,
        childLastName: data.childLastName,
        childDateOfBirth: data.childDateOfBirth,
        desiredClass: data.desiredClass,
        message: data.message ?? "",
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <Card className="text-center shadow-lg border-0 py-10">
              <CardContent>
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Application Received!
                </h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Thank you for your interest in Fransgiddy Montessori. We have
                  received your application and will be in touch shortly.
                </p>
                <Button asChild variant="outline">
                  <Link href="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-indigo-100 rounded-full p-3">
                    <GraduationCap className="h-7 w-7 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Admission Enquiry</CardTitle>
                <CardDescription>
                  Fill in the form below to apply for admission to Fransgiddy
                  Montessori
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Parent Information */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                      Parent / Guardian Information
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="parentName">Full Name *</Label>
                        <Input
                          id="parentName"
                          placeholder="John Doe"
                          {...register("parentName")}
                        />
                        {errors.parentName && (
                          <p className="text-xs text-red-600">
                            {errors.parentName.message}
                          </p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="parentEmail">Email Address *</Label>
                          <Input
                            id="parentEmail"
                            type="email"
                            placeholder="parent@example.com"
                            {...register("parentEmail")}
                          />
                          {errors.parentEmail && (
                            <p className="text-xs text-red-600">
                              {errors.parentEmail.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="parentPhone">Phone Number *</Label>
                          <Input
                            id="parentPhone"
                            type="tel"
                            placeholder="+233 20 000 0000"
                            {...register("parentPhone")}
                          />
                          {errors.parentPhone && (
                            <p className="text-xs text-red-600">
                              {errors.parentPhone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child Information */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                      Child Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="childFirstName">First Name *</Label>
                          <Input
                            id="childFirstName"
                            placeholder="Jane"
                            {...register("childFirstName")}
                          />
                          {errors.childFirstName && (
                            <p className="text-xs text-red-600">
                              {errors.childFirstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="childLastName">Last Name *</Label>
                          <Input
                            id="childLastName"
                            placeholder="Doe"
                            {...register("childLastName")}
                          />
                          {errors.childLastName && (
                            <p className="text-xs text-red-600">
                              {errors.childLastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="childDateOfBirth">
                            Date of Birth *
                          </Label>
                          <Input
                            id="childDateOfBirth"
                            type="date"
                            {...register("childDateOfBirth")}
                          />
                          {errors.childDateOfBirth && (
                            <p className="text-xs text-red-600">
                              {errors.childDateOfBirth.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="desiredClass">Desired Class *</Label>
                          <Input
                            id="desiredClass"
                            placeholder="e.g. Nursery 1, Primary 3"
                            {...register("desiredClass")}
                          />
                          {errors.desiredClass && (
                            <p className="text-xs text-red-600">
                              {errors.desiredClass.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message">
                      Additional Message{" "}
                      <span className="text-gray-400">(optional)</span>
                    </Label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Any additional information you'd like to share..."
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...register("message")}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
