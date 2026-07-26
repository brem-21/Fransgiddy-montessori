"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Trash2, Globe, EyeOff, MessageSquare, Users, GraduationCap,
  Send, Search, CheckSquare, Square, Clock, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { announcementApi, smsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Announcement, SmsContact, SmsRequestResponse } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["NEWS", "EVENT", "ANNOUNCEMENT"]),
  published: z.boolean(),
});

type FormData = z.infer<typeof schema>;
type RecipientType = "ALL" | "PARENTS" | "TEACHERS" | "CUSTOM";

// ── Contact picker ────────────────────────────────────────────────────────────

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
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
      return matchType && matchSearch;
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
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-pebble rounded-none focus:outline-none focus:ring-2 focus:ring-clay"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="text-sm border border-pebble rounded-none px-2 focus:outline-none focus:ring-2 focus:ring-clay"
        >
          <option value="ALL">All</option>
          <option value="PARENT">Parents</option>
          <option value="TEACHER">Teachers</option>
        </select>
      </div>

      <div className="border border-pebble rounded-none overflow-hidden">
        {/* Select-all header */}
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-2 w-full px-3 py-2 bg-white border-b border-pebble text-xs font-bold text-ash hover:bg-pebble/20"
        >
          {allChecked
            ? <CheckSquare className="h-3.5 w-3.5 text-ink" />
            : <Square className="h-3.5 w-3.5 text-ash" />}
          Select all visible ({filtered.length})
        </button>

        <div className="max-h-52 overflow-y-auto divide-y divide-pebble">
          {filtered.length === 0 ? (
            <p className="text-xs text-ash text-center py-4">No contacts found</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.phone}
                type="button"
                onClick={() => toggle(c.phone)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-white transition-colors ${
                  selected.has(c.phone) ? "bg-white" : ""
                }`}
              >
                {selected.has(c.phone)
                  ? <CheckSquare className="h-4 w-4 text-ink shrink-0" />
                  : <Square className="h-4 w-4 text-ash shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{c.name}</p>
                  <p className="text-xs text-ash">{c.phone}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                  c.type === "PARENT"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-green-50 text-green-600"
                }`}>
                  {c.type === "PARENT" ? "Parent" : "Teacher"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-ash">{selected.size} contact(s) selected</p>
    </div>
  );
}

// ── SMS Request row ────────────────────────────────────────────────────────────

function SmsRequestRow({
  req,
  onApprove,
  onReject,
  approving,
}: {
  req: SmsRequestResponse;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  approving: number | null;
}) {
  const statusIcon =
    req.status === "PENDING" ? <Clock className="h-3.5 w-3.5 text-amber-500" /> :
    req.status === "APPROVED" ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> :
    <XCircle className="h-3.5 w-3.5 text-red-500" />;

  const statusColor =
    req.status === "PENDING" ? "text-amber-600 bg-amber-50" :
    req.status === "APPROVED" ? "text-green-700 bg-green-50" :
    "text-red-600 bg-red-50";

  return (
    <TableRow>
      <TableCell className="text-sm font-bold text-ink max-w-xs">
        <p className="truncate">{req.message}</p>
      </TableCell>
      <TableCell className="text-sm text-ash">{req.requestedByName}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs uppercase">{req.recipientType}</Badge>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
          {statusIcon} {req.status}
        </span>
      </TableCell>
      <TableCell className="text-xs text-ash">
        {new Date(req.createdAt).toLocaleDateString("en-GB")}
      </TableCell>
      {req.status === "PENDING" && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(req.id)}
              disabled={approving === req.id}
            >
              {approving === req.id ? "Sending..." : "Approve & Send"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onReject(req.id)}
              disabled={approving === req.id}
            >
              Reject
            </Button>
          </div>
        </TableCell>
      )}
      {req.status !== "PENDING" && (
        <TableCell className="text-right text-xs text-ash">
          {req.reviewedByName ? `by ${req.reviewedByName}` : "—"}
        </TableCell>
      )}
    </TableRow>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SMS state
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("ALL");
  const [contacts, setContacts] = useState<SmsContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [recipientCounts, setRecipientCounts] = useState<{ parents: number; teachers: number; all: number } | null>(null);
  const [smsSending, setSmsSending] = useState(false);

  // SMS requests (teacher drafts)
  const [smsRequests, setSmsRequests] = useState<SmsRequestResponse[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "ANNOUNCEMENT", published: false },
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementApi.getAll();
      setAnnouncements(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load announcements.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsRequests = async () => {
    try {
      const res = await smsApi.getPendingRequests();
      setSmsRequests(res.data.data);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchSmsRequests();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await announcementApi.create(data);
      const newAnnouncement = res.data.data;
      if (selectedFiles.length > 0) {
        await Promise.allSettled(selectedFiles.map((f) => announcementApi.uploadMedia(newAnnouncement.id, f)));
      }
      toast({ title: "Success", description: "Announcement created." });
      setDialogOpen(false);
      reset();
      setSelectedFiles([]);
      fetchAnnouncements();
    } catch {
      toast({ title: "Error", description: "Failed to create announcement.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (a: Announcement) => {
    try {
      await announcementApi.publish(a.id);
      toast({ title: "Updated", description: a.published ? "Unpublished." : "Published." });
      fetchAnnouncements();
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    try {
      await announcementApi.delete(id);
      toast({ title: "Deleted", description: "Announcement removed." });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const openSmsDialog = async () => {
    setSmsOpen(true);
    try {
      const [countRes, contactRes] = await Promise.all([
        smsApi.getRecipientCounts(),
        smsApi.getContacts(),
      ]);
      setRecipientCounts(countRes.data.data);
      setContacts(contactRes.data.data);
    } catch {
      // non-critical
    }
  };

  const handleSendSms = async () => {
    if (!smsMessage.trim()) {
      toast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
      return;
    }
    if (recipientType === "CUSTOM" && selectedContacts.size === 0) {
      toast({ title: "Error", description: "Select at least one contact.", variant: "destructive" });
      return;
    }
    setSmsSending(true);
    try {
      const phones = recipientType === "CUSTOM" ? Array.from(selectedContacts) : undefined;
      const res = await smsApi.send({ message: smsMessage, recipientType, customPhones: phones });
      const { sent, failed, details } = res.data.data;
      toast({
        title: failed === 0 ? "SMS Sent" : "SMS Sent with errors",
        description: details,
        variant: failed === 0 ? "default" : "destructive",
      });
      if (sent > 0) {
        setSmsOpen(false);
        setSmsMessage("");
        setRecipientType("ALL");
        setSelectedContacts(new Set());
      }
    } catch {
      toast({ title: "Error", description: "Failed to send SMS.", variant: "destructive" });
    } finally {
      setSmsSending(false);
    }
  };

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await smsApi.approveRequest(id);
      const { details } = res.data.data;
      toast({ title: "Approved & Sent", description: details });
      fetchSmsRequests();
    } catch {
      toast({ title: "Error", description: "Failed to approve request.", variant: "destructive" });
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Reject this SMS request?")) return;
    try {
      await smsApi.rejectRequest(id);
      toast({ title: "Rejected", description: "SMS request rejected." });
      fetchSmsRequests();
    } catch {
      toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
    }
  };

  const pendingCount = smsRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Content Management</h1>
          <p className="text-ash text-sm mt-1">Manage announcements, news and events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openSmsDialog}>
            <MessageSquare className="h-4 w-4 mr-1" /> Send SMS
          </Button>
          <Button onClick={() => { reset(); setSelectedFiles([]); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Announcement
          </Button>
        </div>
      </div>

      {/* ── Announcements table ── */}
      <Card className="  ">
        {loading ? (
          <div className="p-8 text-center text-ash">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-ash">No announcements yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-bold">
                    {a.title}
                    {a.mediaUrls && a.mediaUrls.length > 0 && (
                      <span className="ml-2 text-xs text-ash">📎 {a.mediaUrls.length}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs uppercase">{a.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {a.published
                      ? <Badge variant="default" className="text-xs">Published</Badge>
                      : <Badge variant="outline" className="text-xs">Draft</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-ash">{a.authorName}</TableCell>
                  <TableCell className="text-sm text-ash">
                    {new Date(a.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handlePublishToggle(a)}
                        title={a.published ? "Unpublish" : "Publish"}>
                        {a.published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Teacher SMS requests ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-ink">Teacher SMS Requests</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <Card className="  ">
          {smsRequests.length === 0 ? (
            <div className="p-8 text-center text-ash text-sm">No SMS requests from teachers.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smsRequests.map((req) => (
                  <SmsRequestRow
                    key={req.id}
                    req={req}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    approving={approvingId}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* ── SMS Dialog ── */}
      <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-ink" />
              Send SMS Broadcast
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recipient type */}
            <div className="space-y-1.5">
              <Label>Send To</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "ALL", label: "Everyone", icon: <Send className="h-4 w-4" />, count: recipientCounts?.all },
                  { value: "PARENTS", label: "Parents only", icon: <Users className="h-4 w-4" />, count: recipientCounts?.parents },
                  { value: "TEACHERS", label: "Teachers only", icon: <GraduationCap className="h-4 w-4" />, count: recipientCounts?.teachers },
                  { value: "CUSTOM", label: "Select contacts", icon: <Search className="h-4 w-4" />, count: null },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecipientType(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-none border text-sm font-bold transition-colors text-left ${
                      recipientType === opt.value
                        ? "border-clay bg-white text-ink"
                        : "border-pebble text-ash hover:border-pebble"
                    }`}
                  >
                    {opt.icon}
                    <span className="flex-1">{opt.label}</span>
                    {opt.count != null && (
                      <span className="text-xs bg-pebble/20 text-ash px-1.5 py-0.5 rounded-full">
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact picker for CUSTOM */}
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
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="flex w-full rounded-none border border-pebble bg-white px-3 py-2 text-sm placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-ash">
                <span>{smsMessage.length} characters</span>
                <span>{Math.ceil(smsMessage.length / 160)} SMS credit(s)</span>
              </div>
            </div>

            {/* Preview */}
            {recipientType !== "CUSTOM" && recipientCounts && (
              <Card className="bg-white border-pebble">
                <CardContent className="py-3 px-4">
                  <p className="text-sm text-ink">
                    This will send to{" "}
                    <strong>
                      {recipientType === "ALL" ? recipientCounts.all
                        : recipientType === "PARENTS" ? recipientCounts.parents
                        : recipientCounts.teachers}
                    </strong>{" "}
                    recipient(s).
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSmsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendSms}
              disabled={smsSending || !smsMessage.trim() || (recipientType === "CUSTOM" && selectedContacts.size === 0)}
            >
              <Send className="h-4 w-4 mr-1" />
              {smsSending ? "Sending..." : "Send SMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Announcement Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Announcement title" {...register("title")} />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                rows={5}
                placeholder="Write your announcement here..."
                className="flex w-full rounded-none border border-pebble bg-white px-3 py-2 text-sm placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent resize-none"
                {...register("content")}
              />
              {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                        <SelectItem value="NEWS">News</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Publish immediately?</Label>
                <div className="flex items-center gap-2 h-10">
                  <Controller
                    name="published"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="published"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-pebble text-ink focus:ring-clay"
                      />
                    )}
                  />
                  <label htmlFor="published" className="text-sm text-ash">Yes, publish now</label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Attachments (optional)</Label>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-ash file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-white file:text-ink hover:file:bg-ink"
              />
              {selectedFiles.length > 0 && (
                <ul className="text-xs text-ash space-y-0.5 mt-1">
                  {selectedFiles.map((f, i) => (
                    <li key={i}>📎 {f.name} ({(f.size / 1024).toFixed(0)} KB)</li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
