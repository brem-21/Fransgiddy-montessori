"use client";

import React, { useEffect, useState } from "react";
import { Save, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { settingsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Field {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  hint?: string;
}

const SMS_FIELDS: Field[] = [
  {
    key: "mnotify.api.key",
    label: "mNotify API Key",
    placeholder: "Paste your mNotify API key here",
    secret: true,
    hint: "Found in your mNotify dashboard under API settings.",
  },
  {
    key: "mnotify.sender.id",
    label: "Sender ID",
    placeholder: "e.g. FransgiddyRS",
    hint: "The sender name recipients will see. Must be registered with mNotify.",
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  useEffect(() => {
    settingsApi.getAll()
      .then((res) => setValues(res.data.data))
      .catch(() => toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.saveAll(values);
      setSaved(true);
      toast({ title: "Saved", description: "Settings updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl space-y-8">
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-72 bg-gray-100 animate-pulse rounded" />
        </div>
        <div className="border rounded-lg p-6 space-y-5 bg-white shadow-sm">
          <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 bg-gray-100 animate-pulse rounded" />
              <div className="h-3 w-64 bg-gray-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure integrations and school preferences.</p>
      </div>

      {/* SMS / Arkesel */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">SMS Integration (mNotify)</h2>
          </div>

          {SMS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.secret && !showSecret[field.key] ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="pr-10"
                  maxLength={field.key === "arkesel.sender.id" ? 10 : undefined}
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShowSecret((p) => ({ ...p, [field.key]: !p[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret[field.key]
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {field.hint && (
                <p className="text-xs text-gray-400">{field.hint}</p>
              )}
              {field.key === "mnotify.sender.id" && (values[field.key] ?? "").length > 0 && (
                <p className="text-xs text-gray-400">
                  {(values[field.key] ?? "").length}/10 characters
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
