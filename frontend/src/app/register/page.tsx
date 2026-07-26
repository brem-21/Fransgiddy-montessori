"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          {submitted ? (
            <Card className="text-center    py-10">
              <CardContent>
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-ink mb-2">
                  Application Received!
                </h2>
                <p className="text-ash mb-6 max-w-sm mx-auto">
                  Thank you for your interest in Fransgiddy Royal School. We have
                  received your application and will be in touch shortly.
                </p>
                <Button asChild variant="outline">
                  <Link href="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="  ">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-ink rounded-full p-3">
                    <GraduationCap className="h-7 w-7 text-white" />
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
                    <h3 className="font-bold text-ink mb-3 text-sm uppercase tracking-wide">
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

                      <div className="space-y-1.5">
                        <Label htmlFor="parentPhone">Phone Number *</Label>
                        <Input
                          id="parentPhone"
                          type="tel"
                          placeholder="+233 20 000 0000"
                          maxLength={15}
                          pattern="[0-9+\-\s]{7,15}"
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

                  {/* Child Information */}
                  <div>
                    <h3 className="font-bold text-ink mb-3 text-sm uppercase tracking-wide">
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
                      <span className="text-ash">(optional)</span>
                    </Label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Any additional information you'd like to share..."
                      className="flex w-full rounded-none border border-pebble bg-white px-3 py-2 text-sm placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
        </motion.div>
      </div>
    </div>
  );
}
