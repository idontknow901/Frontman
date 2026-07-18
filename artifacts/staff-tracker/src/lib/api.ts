import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import {
  StaffMember, DashboardSummary, StaffInput, StaffUpdate, WarningInput, StatsUpdate, StatusUpdate, ListStaffParams
} from "./api.schemas";
export * from "./api.schemas";

const STAFF_COLLECTION = "staff";

export const getGetStaffQueryKey = (id: number) => ["staff", id];

export const useGetStaff = (id: number) => {
  return useQuery({
    queryKey: getGetStaffQueryKey(id),
    queryFn: async (): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error("Not found");
      return { id, ...snapshot.data() } as StaffMember;
    },
    enabled: !!id
  });
};

export const useListStaff = (params?: ListStaffParams) => {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: async (): Promise<StaffMember[]> => {
      let q = query(collection(db, STAFF_COLLECTION));
      if (params?.division) q = query(q, where("division", "==", params.division));
      if (params?.status) q = query(q, where("status", "==", params.status));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() } as StaffMember));
    }
  });
};

export const useCreateStaff = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StaffInput): Promise<StaffMember> => {
      const id = Date.now();
      const newStaff: StaffMember = {
        id,
        ...data,
        status: "Active",
        weeklyVoiceHours: 0,
        weeklyMessages: 0,
        weeklyEventsHosted: 0,
        weeklyMiniEventsHosted: 0,
        monthlyVoiceHours: 0,
        monthlyMessages: 0,
        monthlyEventsHosted: 0,
        monthlyMiniEventsHosted: 0,
        writtenWarnings: 0,
        activityStrikes: 0,
        finalStrikes: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, STAFF_COLLECTION, id.toString()), newStaff);
      return newStaff;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useUpdateStaff = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: StaffUpdate }): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      await updateDoc(docRef, { ...data });
      const updated = await getDoc(docRef);
      return { id, ...updated.data() } as StaffMember;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useDeleteStaff = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }): Promise<void> => {
      await deleteDoc(doc(db, STAFF_COLLECTION, id.toString()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useUpdateStats = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: StatsUpdate }): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error("Not found");
      const current = snapshot.data() as StaffMember;
      
      const period = data.period || "weekly";
      const updates: any = {};
      
      if (period === "weekly") {
        if (data.voiceHours !== undefined) updates.weeklyVoiceHours = data.voiceHours;
        if (data.messages !== undefined) updates.weeklyMessages = data.messages;
        if (data.eventsHosted !== undefined) updates.weeklyEventsHosted = data.eventsHosted;
        if (data.miniEventsHosted !== undefined) updates.weeklyMiniEventsHosted = data.miniEventsHosted;
      } else {
        if (data.voiceHours !== undefined) updates.monthlyVoiceHours = data.voiceHours;
        if (data.messages !== undefined) updates.monthlyMessages = data.messages;
        if (data.eventsHosted !== undefined) updates.monthlyEventsHosted = data.eventsHosted;
        if (data.miniEventsHosted !== undefined) updates.monthlyMiniEventsHosted = data.miniEventsHosted;
      }
      
      await updateDoc(docRef, updates);
      return { ...current, ...updates, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useUpdateStaffStatus = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: StatusUpdate }): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      const updates: any = { status: data.status };
      if (data.status === "Suspended") updates.suspendedAt = new Date().toISOString();
      if (data.status === "Terminated") updates.terminatedAt = new Date().toISOString();
      
      await updateDoc(docRef, updates);
      const updated = await getDoc(docRef);
      return { id, ...updated.data() } as StaffMember;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useIssueWarning = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: WarningInput }): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error("Not found");
      const current = snapshot.data() as StaffMember;
      
      const updates: any = {};
      if (data.type === "written") {
        updates.writtenWarnings = Math.min((current.writtenWarnings || 0) + 1, 3);
      } else if (data.type === "activityStrike") {
        updates.activityStrikes = Math.min((current.activityStrikes || 0) + 1, 3);
        if (updates.activityStrikes >= 3 && current.status === "Active") {
          updates.status = "Suspended";
          updates.suspendedAt = new Date().toISOString();
        }
      } else if (data.type === "finalStrike") {
        updates.finalStrikes = Math.min((current.finalStrikes || 0) + 1, 3);
        if (updates.finalStrikes >= 3) {
          updates.status = "Terminated";
          updates.terminatedAt = new Date().toISOString();
        }
      }
      
      await updateDoc(docRef, updates);
      return { ...current, ...updates, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useRemoveWarning = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: WarningInput }): Promise<StaffMember> => {
      const docRef = doc(db, STAFF_COLLECTION, id.toString());
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error("Not found");
      const current = snapshot.data() as StaffMember;
      
      const updates: any = {};
      if (data.type === "written") {
        updates.writtenWarnings = Math.max((current.writtenWarnings || 0) - 1, 0);
      } else if (data.type === "activityStrike") {
        updates.activityStrikes = Math.max((current.activityStrikes || 0) - 1, 0);
      } else if (data.type === "finalStrike") {
        updates.finalStrikes = Math.max((current.finalStrikes || 0) - 1, 0);
      }
      
      await updateDoc(docRef, updates);
      return { ...current, ...updates, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
      if (options?.mutation?.onSuccess) options.mutation.onSuccess();
    }
  });
};

export const useGetDashboardSummary = () => {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async (): Promise<DashboardSummary> => {
      const snapshot = await getDocs(collection(db, STAFF_COLLECTION));
      const allStaff = snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() } as StaffMember));
      
      const active = allStaff.filter((s) => s.status === "Active");
      const loa = allStaff.filter((s) => s.status === "LOA");
      const suspended = allStaff.filter((s) => s.status === "Suspended");
      const terminated = allStaff.filter((s) => s.status === "Terminated");

      const eventDiv = allStaff.filter((s) => s.division === "Event");
      const trainingDiv = allStaff.filter((s) => s.division === "Training");

      const totalWritten = allStaff.reduce((sum, s) => sum + (s.writtenWarnings || 0), 0);
      const totalActivity = allStaff.reduce((sum, s) => sum + (s.activityStrikes || 0), 0);
      const totalFinal = allStaff.reduce((sum, s) => sum + (s.finalStrikes || 0), 0);

      const topByVoice = [...allStaff]
        .sort((a, b) => (b.weeklyVoiceHours || 0) - (a.weeklyVoiceHours || 0))
        .slice(0, 3);

      const topByEvents = [...allStaff]
        .sort((a, b) => ((b.weeklyEventsHosted || 0) + (b.weeklyMiniEventsHosted || 0)) - ((a.weeklyEventsHosted || 0) + (a.weeklyMiniEventsHosted || 0)))
        .slice(0, 3);

      return {
        totalStaff: allStaff.length,
        activeStaff: active.length,
        loaStaff: loa.length,
        suspendedStaff: suspended.length,
        terminatedStaff: terminated.length,
        eventDivisionCount: eventDiv.length,
        trainingDivisionCount: trainingDiv.length,
        totalWrittenWarnings: totalWritten,
        totalActivityStrikes: totalActivity,
        totalFinalStrikes: totalFinal,
        topPerformersByVoiceHours: topByVoice,
        topPerformersByEvents: topByEvents,
      };
    }
  });
};
