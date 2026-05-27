"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { registrationApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Registration } from "@/types";

type RegistrationStatus = Registration["status"];

const statusConfig: Record<
  RegistrationStatus,
  { label: string; variant: "warning" | "info" | "success" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  REVIEWED: { label: "Reviewed", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationApi.getAll();
      setRegistrations(res.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleStatusChange = async (
    id: number,
    status: RegistrationStatus
  ) => {
    setUpdatingId(id);
    try {
      await registrationApi.updateStatus(id, status);
      toast({ title: "Updated", description: "Registration status updated." });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and manage admission enquiries.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No registrations received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent Name</TableHead>
                <TableHead>Child Name</TableHead>
                <TableHead>Desired Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => {
                const config = statusConfig[reg.status];
                return (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="font-medium">{reg.parentName}</div>
                      <div className="text-xs text-gray-400">{reg.parentPhone}</div>
                    </TableCell>
                    <TableCell>
                      {reg.childFirstName} {reg.childLastName}
                    </TableCell>
                    <TableCell className="text-sm">{reg.desiredClass}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reg.status}
                        onValueChange={(val) =>
                          handleStatusChange(reg.id, val as RegistrationStatus)
                        }
                        disabled={updatingId === reg.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="REVIEWED">Reviewed</SelectItem>
                          <SelectItem value="ACCEPTED">Accepted</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
