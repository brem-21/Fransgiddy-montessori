"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MessageSquare, Send, Users, GraduationCap, Search,
  CheckSquare, Square, Clock, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { teacherSmsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { SmsContact, SmsRequestResponse } from "@/types";

type RecipientType = "ALL" | "PARENTS" | "TEACHERS" | "CUSTOM";

// ── Contact picker (reused logic) ─────────────────────────────────────────────

function ContactPicker({
  contacts,
  selected,
  onChange,
}: {
  contacts: SmsContact[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PARENT" | "TEACHER">("ALL");

  const filtered = useMemo(() =>
    contacts.filter((c) => {
      const matchType = typeFilter === "ALL" || c.type === typeFilter;
      const q = search.toLowerCase();
      return matchType && (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }),
    [contacts, search, typeFilter]
  );

  const toggle = (phone: string) => {
    const next = new Set(selected);
    next.has(phone) ? next.delete(phone) : next.add(phone);
    onChange(next);
  };

  const toggleAll = () => {
    if (filtered.every((c) => selected.has(c.phone))) {
      const next = new Set(selected);
      filtered.forEach((c) => next.delete(c.phone));
      onChange(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((c) => next.add(c.phone));
      onChange(next);
    }
  };

  const allChecked = filtered.length > 0 && filtered.every((c) => selected.has(c.phone));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="text-sm border border-gray-300 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All</option>
          <option value="PARENT">Parents</option>
          <option value="TEACHER">Teachers</option>
        </select>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100"
        >
          {allChecked
            ? <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
            : <Square className="h-3.5 w-3.5 text-gray-400" />}
          Select all visible ({filtered.length})
        </button>

        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No contacts found</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.phone}
                type="button"
                onClick={() => toggle(c.phone)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                  selected.has(c.phone) ? "bg-indigo-50" : ""
                }`}
              >
                {selected.has(c.phone)
                  ? <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0" />
                  : <Square className="h-4 w-4 text-gray-300 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                  c.type === "PARENT" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                }`}>
                  {c.type === "PARENT" ? "Parent" : "Teacher"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">{selected.size} contact(s) selected</p>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SmsRequestResponse["status"] }) {
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-amber-600 bg-amber-50">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-green-700 bg-green-50">
        <CheckCircle className="h-3 w-3" /> Approved & Sent
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-red-600 bg-red-50">
      <XCircle className="h-3 w-3" /> Rejected
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherSmsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("ALL");
  const [contacts, setContacts] = useState<SmsContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<SmsRequestResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await teacherSmsApi.getMyRequests();
      setMyRequests(res.data.data);
    } catch {
      // non-critical
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDialog = async () => {
    setDialogOpen(true);
    if (contacts.length === 0) {
      try {
        const res = await teacherSmsApi.getContacts();
        setContacts(res.data.data);
      } catch {
        // non-critical
      }
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
      return;
    }
    if (recipientType === "CUSTOM" && selectedContacts.size === 0) {
      toast({ title: "Error", description: "Select at least one contact.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const phones = recipientType === "CUSTOM" ? Array.from(selectedContacts) : undefined;
      await teacherSmsApi.createRequest({ message, recipientType, customPhones: phones });
      toast({
        title: "Request Submitted",
        description: "Your SMS request has been sent to the principal for approval.",
      });
      setDialogOpen(false);
      setMessage("");
      setRecipientType("ALL");
      setSelectedContacts(new Set());
      fetchRequests();
    } catch {
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const parentCount = contacts.filter((c) => c.type === "PARENT").length;
  const teacherCount = contacts.filter((c) => c.type === "TEACHER").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Broadcast</h1>
          <p className="text-gray-500 text-sm mt-1">
            Request an SMS broadcast to parents or teachers. The principal will review and send it.
          </p>
        </div>
        <Button onClick={openDialog}>
          <MessageSquare className="h-4 w-4 mr-1" /> New SMS Request
        </Button>
      </div>

      {/* ── My requests ── */}
      <Card className="border-0 shadow-sm">
        {loadingRequests ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : myRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            You haven't submitted any SMS requests yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="text-sm font-medium text-gray-800 max-w-xs">
                    <p className="truncate">{req.message}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs uppercase">{req.recipientType}</Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {req.reviewedByName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── New request dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Request SMS Broadcast
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500 -mt-1">
            Your message will be reviewed by the principal before sending.
          </p>

          <div className="space-y-4">
            {/* Recipient type */}
            <div className="space-y-1.5">
              <Label>Send To</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "ALL", label: "Everyone", icon: <Send className="h-4 w-4" />, count: parentCount + teacherCount },
                  { value: "PARENTS", label: "Parents only", icon: <Users className="h-4 w-4" />, count: parentCount },
                  { value: "TEACHERS", label: "Teachers only", icon: <GraduationCap className="h-4 w-4" />, count: teacherCount },
                  { value: "CUSTOM", label: "Select contacts", icon: <Search className="h-4 w-4" />, count: null },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecipientType(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                      recipientType === opt.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.icon}
                    <span className="flex-1">{opt.label}</span>
                    {opt.count != null && contacts.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact picker */}
            {recipientType === "CUSTOM" && (
              <div className="space-y-1.5">
                <Label>Select Recipients</Label>
                <ContactPicker
                  contacts={contacts}
                  selected={selectedContacts}
                  onChange={setSelectedContacts}
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-1.5">
              <Label>Message</Label>
              <textarea
                rows={5}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{message.length} characters</span>
                <span>{Math.ceil(message.length / 160)} SMS credit(s)</span>
              </div>
            </div>

            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-amber-700">
                  This request will be reviewed by the principal before the SMS is sent.
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !message.trim() || (recipientType === "CUSTOM" && selectedContacts.size === 0)}
            >
              <Send className="h-4 w-4 mr-1" />
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
