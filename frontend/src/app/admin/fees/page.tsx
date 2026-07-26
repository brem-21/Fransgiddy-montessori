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
import { ExcelImportDialog } from "@/components/ExcelImportDialog";
import { feeApi, userApi, studentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Fee, User, Student } from "@/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  collectedById: z.string().min(1, "Select who collected this payment"),
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

export default function AdminFeesPage() {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allFees, setAllFees] = useState<Fee[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { feeDate: todayISO(), description: "", collectedById: "", studentId: "" },
  });

  const fetchData = async () => {
    const feesRes = await feeApi.myFees().catch(() => null);
    if (feesRes) setAllFees(feesRes.data.data);
  };

  useEffect(() => {
    Promise.allSettled([
      studentApi.getAll(),
      userApi.getAll(),
      feeApi.myFees(),
    ]).then(([studRes, usersRes, feesRes]) => {
      if (studRes.status === "fulfilled")
        setStudents(studRes.value.data.data.filter((s) => s.active));
      if (usersRes.status === "fulfilled")
        setTeachers(usersRes.value.data.data.filter((u) => u.role === "TEACHER" && u.active));
      if (feesRes.status === "fulfilled")
        setAllFees(feesRes.value.data.data);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await feeApi.enter({
        studentId: Number(data.studentId),
        amount: data.amount,
        description: data.description || undefined,
        feeDate: data.feeDate,
        collectedById: Number(data.collectedById),
      });
      toast({
        title: "Payment Recorded",
        description: `Fee of ${formatGHS(data.amount)} recorded successfully.`,
      });
      reset({ feeDate: todayISO(), description: "", collectedById: "", studentId: "" });
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
  const todayEntries = allFees.filter((f) => f.feeDate === today);
  const todayTotal = todayEntries.reduce((sum, f) => sum + f.amount, 0);

  // Build collector options: teachers + principal (self)
  const collectorOptions: { id: string; name: string }[] = [
    ...(currentUser ? [{ id: String(currentUser.id), name: `${currentUser.name} (You)` }] : []),
    ...teachers.map((t) => ({ id: String(t.id), name: t.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Enter Daily Fees</h1>
          <p className="text-ash text-sm mt-1">
            Record fee payments on behalf of any teacher or yourself.
          </p>
        </div>
        <ExcelImportDialog
          entityLabel="Fees"
          onImport={feeApi.importExcel}
          onDownloadTemplate={feeApi.downloadTemplate}
          templateFilename="fees_template.xlsx"
          onComplete={fetchData}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fee Entry Form */}
        <Card className="  ">
          <CardHeader>
            <CardTitle className="text-base">Record Fee Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Collected By */}
              <div className="space-y-1.5">
                <Label>Collected By *</Label>
                <Controller
                  name="collectedById"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collector..." />
                      </SelectTrigger>
                      <SelectContent>
                        {collectorOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.collectedById && (
                  <p className="text-xs text-red-600">{errors.collectedById.message}</p>
                )}
              </div>

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
                  <p className="text-xs text-red-600">{errors.studentId.message}</p>
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
                  Description <span className="text-ash">(optional)</span>
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
                <Input id="feeDate" type="date" {...register("feeDate")} />
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

        {/* Today's Entries */}
        <Card className="  ">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayEntries.length === 0 ? (
              <div className="p-8 text-center text-ash text-sm">
                No fees recorded today.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Class</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden sm:table-cell">Collected By</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayEntries.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-bold">{f.studentName}</TableCell>
                          <TableCell className="text-sm text-ash hidden sm:table-cell">
                            {f.studentClass}
                          </TableCell>
                          <TableCell className="font-bold text-ink">
                            {formatGHS(f.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-ash hidden sm:table-cell">
                            {f.collectedByName}
                          </TableCell>
                          <TableCell className="text-sm text-ash hidden md:table-cell">
                            {f.description || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="px-4 py-3 border-t border-pebble flex justify-end">
                  <span className="text-sm font-bold text-ink">
                    Today&apos;s Total:{" "}
                    <span className="text-ink">{formatGHS(todayTotal)}</span>
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
