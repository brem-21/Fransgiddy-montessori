import { useEffect, useState } from "react";
import { studentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Student } from "@/types";

export function useMyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    studentApi
      .getAll()
      .then((res) => setStudents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return { students, loading };
}
