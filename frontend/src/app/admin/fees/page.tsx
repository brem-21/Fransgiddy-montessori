"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { feeApi } from "@/lib/api";
import { useMyStudents } from "@/hooks/use-my-students";
import { toast } from "@/hooks/use-toast";
import type { Fee } from "@/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  description: z.string().optional().default(""),
  feeDate: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof schema>;

function formatGHS(amount: number) {
  return (
    "₵" +
    amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function TeacherFeesPage() {
  const { students } = useMyStudents();
  const [myFees, setMyFees] = useState<Fee[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { feeDate: todayISO(), description: "" },
  });

  const fetchData = async () => {
    const feesRes = await feeApi.myFees().catch(() => null);
    if (feesRes) setMyFees(feesRes.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await feeApi.enter({
        studentId: Number(data.studentId),
        amount: data.amount,
        description: data.description || undefined,
        feeDate: data.feeDate,
      });
      toast({
        title: "Payment Recorded",
        description: `Fee of ${formatGHS(data.amount)} recorded successfully.`,
      });
      reset({ feeDate: todayISO(), description: "" });
      fetchData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to record fee payment.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const today = todayISO();
  const todayEntries = myFees.filter((f) => f.feeDate === today);
  const todayTotal = todayEntries.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Daily Fees</h1>
        <p className="text-gray-500 text-sm mt-1">
          Record fee payments collected from students.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — Fee Entry Form */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Record Fee Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Student */}
              <div className="space-y-1.5">
                <Label>Student *</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.firstName} {s.lastName} — {s.className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.studentId && (
                  <p className="text-xs text-red-600">
                    {errors.studentId.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₵) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 150.00"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-xs text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="description"
                  placeholder="e.g. Term fees, Activity fee"
                  {...register("description")}
                />
              </div>

              {/* Fee Date */}
              <div className="space-y-1.5">
                <Label htmlFor="feeDate">Fee Date *</Label>
                <Input
                  id="feeDate"
                  type="date"
                  {...register("feeDate")}
                />
                {errors.feeDate && (
                  <p className="text-xs text-red-600">{errors.feeDate.message}</p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right — Today's Entries */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No fees recorded today.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Amount (₵)</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayEntries.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">
                          {f.studentName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {f.studentClass}
                        </TableCell>
                        <TableCell className="font-semibold text-indigo-700">
                          {formatGHS(f.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {f.description || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(f.createdAt).toLocaleTimeString("en-GH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
                  <span className="text-sm font-semibold text-gray-700">
                    Total:{" "}
                    <span className="text-indigo-700">
                      {formatGHS(todayTotal)}
                    </span>
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
