export interface EnquiryMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  text: string;
  createdAt: string;
}

export interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  subject: string;
  message: string;
  programInterested?: string | undefined;
  status: "New" | "In Progress" | "Resolved";
  createdAt: string;
  notes?: string | undefined;
  userId?: string | undefined;
  thread?: EnquiryMessage[] | undefined;
}

const STORAGE_KEY = "kriya_admin_enquiries_v1";

const SEED_ENQUIRIES: EnquiryItem[] = [
  {
    id: "enq_1",
    name: "Dr. Meenakshi Sundaram",
    email: "meenakshi.s@gmail.com",
    phone: "+91 94432 11223",
    subject: "Prerequisites for 1st Kriya Diksha",
    message: "Namaste. I have been practicing basic pranayama for 2 years. Do I need any prior meditation experience before attending the Inner Awakening Kriya batch?",
    programInterested: "Inner Awakening Kriya",
    status: "Resolved",
    createdAt: "2026-10-22T07:15:00Z",
    notes: "Clarified prerequisites and sent guidance via email.",
  },
  {
    id: "enq_2",
    name: "Arunachalam Murugesan",
    email: "arun.murugan@yahoo.co.in",
    phone: "+91 98402 88990",
    subject: "Tamil Batch Schedule Inquiry",
    message: "வணக்கம் ஐயா. அடுத்த நேரடி ஆன்லைன் தமிழ் வகுப்பு எப்போது தொடங்கும் என்பதை அறிய விரும்புகிறேன்.",
    programInterested: "Live Online Group (Tamil)",
    status: "In Progress",
    createdAt: "2026-10-21T16:40:00Z",
    notes: "Followed up via email regarding November 2026 batch.",
  },
  {
    id: "enq_3",
    name: "Siddharth Ramesh",
    email: "siddharth.r@techcorp.com",
    phone: "+91 99620 44332",
    subject: "Medical Accommodation for Spine Posture",
    message: "I have lower back stiffness and cannot sit cross-legged on the floor for long hours. Can I sit on a chair during the guided initiation sessions?",
    programInterested: "Pranayama Vayu Intensive",
    status: "Resolved",
    createdAt: "2026-10-20T10:10:00Z",
    notes: "Clarified chair sadhana guidelines; seeker enrolled happily.",
  },
  {
    id: "enq_4",
    name: "Lavanya Balakrishnan",
    email: "lavanya.b@gmail.com",
    phone: "+91 98845 66778",
    subject: "Family Initiation Package Details",
    message: "Greetings. My husband and I would like to take initiation together along with our 16-year-old daughter. Are there joint sessions available?",
    programInterested: "Family Initiation",
    status: "Resolved",
    createdAt: "2026-10-22T06:00:00Z",
    notes: "Sent family initiation batch schedule via email.",
  },
];

export function getEnquiryThread(item: EnquiryItem): EnquiryMessage[] {
  if (item.thread && item.thread.length > 0) {
    return item.thread;
  }
  const synthesized: EnquiryMessage[] = [
    {
      id: `${item.id}_initial`,
      sender: "user",
      senderName: item.name || "User",
      text: item.message,
      createdAt: item.createdAt,
    },
  ];
  if (item.notes && item.notes.trim()) {
    synthesized.push({
      id: `${item.id}_guidance`,
      sender: "admin",
      senderName: "Teacher Guidance",
      text: item.notes.trim(),
      createdAt: item.createdAt,
    });
  }
  return synthesized;
}

/**
 * Consolidate multiple inquiries from the same user ID or email into ONE single EnquiryItem thread.
 */
function consolidateUserEnquiries(list: EnquiryItem[]): { items: EnquiryItem[]; modified: boolean } {
  const map = new Map<string, EnquiryItem>();
  let hasMerged = false;

  for (const item of list) {
    const cleanEmail = (item.email || "").trim().toLowerCase();
    const cleanUid = (item.userId || "").trim().toLowerCase();

    // Find any existing item that shares the same userId or same email
    let matchedKey: string | null = null;
    for (const [key, existing] of map.entries()) {
      const existingEmail = (existing.email || "").trim().toLowerCase();
      const existingUid = (existing.userId || "").trim().toLowerCase();

      if (cleanUid && existingUid && cleanUid === existingUid) {
        matchedKey = key;
        break;
      }
      if (cleanEmail && existingEmail && cleanEmail === existingEmail) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      const newKey = cleanUid ? `uid:${cleanUid}` : `email:${cleanEmail || ("item_" + Date.now())}`;
      const effectiveId = item.userId || item.id;
      map.set(newKey, { ...item, id: effectiveId, thread: getEnquiryThread(item) });
    } else {
      hasMerged = true;
      const existing = map.get(matchedKey)!;
      const existingThread = existing.thread || getEnquiryThread(existing);
      const incomingThread = getEnquiryThread(item);

      // Merge threads avoiding duplicates
      const mergedThread = [...existingThread];
      for (const msg of incomingThread) {
        const isDuplicate = mergedThread.some(
          (m) =>
            m.text.trim() === msg.text.trim() &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 4000
        );
        if (!isDuplicate) {
          mergedThread.push(msg);
        }
      }
      mergedThread.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // If either had "New" status, the consolidated enquiry is "New"
      const isNew = existing.status === "New" || item.status === "New";
      const isInProg = !isNew && (existing.status === "In Progress" || item.status === "In Progress");
      const finalStatus: EnquiryItem["status"] = isNew ? "New" : (isInProg ? "In Progress" : "Resolved");

      // Pick latest message, subject, date, and program
      const isItemNewer = new Date(item.createdAt).getTime() >= new Date(existing.createdAt).getTime();
      const latestDate = isItemNewer ? item.createdAt : existing.createdAt;
      const latestMessage = isItemNewer ? item.message : existing.message;
      const latestSubject = isItemNewer ? item.subject : existing.subject;
      const latestProgram = isItemNewer
        ? (item.programInterested || existing.programInterested)
        : (existing.programInterested || item.programInterested);

      const effectiveId = existing.userId || item.userId || existing.id;

      map.set(matchedKey, {
        ...existing,
        id: effectiveId,
        userId: existing.userId || item.userId,
        name: existing.name || item.name,
        email: existing.email || item.email,
        phone: existing.phone || item.phone,
        message: latestMessage,
        subject: latestSubject,
        programInterested: latestProgram,
        createdAt: latestDate,
        status: finalStatus,
        notes: isItemNewer ? (item.notes || existing.notes) : (existing.notes || item.notes),
        thread: mergedThread,
      });
    }
  }

  const items = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { items, modified: hasMerged };
}

export function getStoredEnquiries(): EnquiryItem[] {
  if (typeof window === "undefined") return SEED_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENQUIRIES));
      return SEED_ENQUIRIES;
    }
    const list: EnquiryItem[] = JSON.parse(raw);
    let modified = false;

    // Auto-clean legacy seed items
    for (const item of list) {
      if ((item.id === "enq_1" || item.id === "enq_4") && item.status === "New") {
        item.status = "Resolved";
        item.notes = item.notes || "Guidance completed via email.";
        modified = true;
      }
    }

    // Always consolidate by user / email so single user only has 1 item in Admin!
    const consolidated = consolidateUserEnquiries(list);
    if (consolidated.modified || modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consolidated.items));
    }
    return consolidated.items;
  } catch {
    return SEED_ENQUIRIES;
  }
}

let sharedChannel: BroadcastChannel | null = null;
function getSharedChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!sharedChannel) {
    try {
      sharedChannel = new BroadcastChannel("kriya_enquiries_bc_v1");
    } catch {}
  }
  return sharedChannel;
}

export function saveStoredEnquiries(items: EnquiryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("kriya_enquiries_updated"));
    const bc = getSharedChannel();
    if (bc) {
      bc.postMessage({ type: "kriya_enquiries_updated", timestamp: Date.now() });
    }
  } catch (e) {
    console.error("Failed to save enquiries:", e);
  }
}

export function subscribeToEnquiries(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // 1. Same-window custom event
  const handleLocal = () => callback();
  window.addEventListener("kriya_enquiries_updated", handleLocal);

  // 2. Cross-tab storage event
  const handleStorage = (e: StorageEvent) => {
    if (!e.key || e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);

  // 3. Cross-tab BroadcastChannel
  const bc = getSharedChannel();
  const handleBc = () => callback();
  if (bc) {
    bc.addEventListener("message", handleBc);
  }

  // 4. Polling fallback every 800ms
  const intervalId = setInterval(callback, 800);

  return () => {
    window.removeEventListener("kriya_enquiries_updated", handleLocal);
    window.removeEventListener("storage", handleStorage);
    if (bc) {
      bc.removeEventListener("message", handleBc);
    }
    clearInterval(intervalId);
  };
}

export async function fetchAllEnquiries(): Promise<EnquiryItem[]> {
  return getStoredEnquiries();
}

export async function addEnquiryMessage(
  id: string,
  sender: "user" | "admin",
  text: string,
  senderName?: string
): Promise<EnquiryItem | null> {
  const list = getStoredEnquiries();
  const cleanId = (id || "").trim().toLowerCase();
  const idx = list.findIndex(
    (e) =>
      (e.id && e.id.toLowerCase() === cleanId) ||
      (e.userId && e.userId.toLowerCase() === cleanId) ||
      (e.email && e.email.toLowerCase() === cleanId)
  );
  const existing = list[idx];
  if (!existing) return null;

  const currentThread = getEnquiryThread(existing);
  const newMsg: EnquiryMessage = {
    id: "msg_" + Date.now(),
    sender,
    senderName: senderName || (sender === "admin" ? "Teacher Guidance" : existing.name),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const updatedThread = [...currentThread, newMsg];
  // If admin sent message, status is Resolved. If user sent follow-up, status is New (triggers badge)
  const newStatus: EnquiryItem["status"] = sender === "admin" ? "Resolved" : "New";

  const updatedItem: EnquiryItem = {
    ...existing,
    thread: updatedThread,
    status: newStatus,
    notes: sender === "admin" ? text.trim() : existing.notes,
  };

  list[idx] = updatedItem;
  saveStoredEnquiries(list);
  return updatedItem;
}

export async function updateEnquiryStatus(id: string, status: EnquiryItem["status"], notes?: string): Promise<boolean> {
  const list = getStoredEnquiries();
  const cleanId = (id || "").trim().toLowerCase();
  const idx = list.findIndex(
    (e) =>
      (e.id && e.id.toLowerCase() === cleanId) ||
      (e.userId && e.userId.toLowerCase() === cleanId) ||
      (e.email && e.email.toLowerCase() === cleanId)
  );
  const existing = list[idx];
  if (!existing) return false;

  let thread = existing.thread ? [...existing.thread] : getEnquiryThread(existing);

  if (notes && notes.trim()) {
    const lastMsg = thread[thread.length - 1];
    if (!lastMsg || lastMsg.sender !== "admin" || lastMsg.text !== notes.trim()) {
      thread.push({
        id: "msg_" + Date.now(),
        sender: "admin",
        senderName: "Teacher Guidance",
        text: notes.trim(),
        createdAt: new Date().toISOString(),
      });
    }
  }

  list[idx] = {
    ...existing,
    status,
    notes: notes !== undefined ? notes : existing.notes,
    thread,
  };
  saveStoredEnquiries(list);
  return true;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const list = getStoredEnquiries();
  const cleanId = (id || "").trim().toLowerCase();
  const filtered = list.filter(
    (e) =>
      e.id.toLowerCase() !== cleanId &&
      (!e.userId || e.userId.toLowerCase() !== cleanId) &&
      (!e.email || e.email.toLowerCase() !== cleanId)
  );
  saveStoredEnquiries(filtered);
  return true;
}

export async function recordNewEnquiry(item: Omit<EnquiryItem, "id" | "createdAt" | "status">): Promise<EnquiryItem> {
  const list = getStoredEnquiries();
  const now = new Date().toISOString();
  const safeName = (item.name || (item as any).full_name || (item.email ? item.email.split("@")[0] : "Seeker")).trim() || "Seeker";
  const safeEmail = (item.email || "seeker@thekriyalab.com").trim();
  const safeSubject = (item.subject || "Spiritual Inquiry").trim();
  const safeMessage = (item.message || "").trim();
  const cleanEmail = safeEmail.toLowerCase();

  // Find if an existing enquiry already exists for this same user / ID / email:
  const existingIdx = list.findIndex(
    (e) =>
      (item.userId && e.userId && e.userId.trim().toLowerCase() === item.userId.trim().toLowerCase()) ||
      (e.email && e.email.trim().toLowerCase() === cleanEmail)
  );

  if (existingIdx >= 0) {
    const existing = list[existingIdx]!;
    const currentThread = getEnquiryThread(existing);
    const newMsg: EnquiryMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      senderName: safeName,
      text: safeMessage,
      createdAt: now,
    };

    const updatedEnq: EnquiryItem = {
      ...existing,
      name: safeName || existing.name,
      phone: item.phone || existing.phone,
      subject: safeSubject,
      message: safeMessage,
      programInterested: item.programInterested || existing.programInterested,
      status: "New", // Mark as New so admin sees the red notification & badge
      createdAt: now, // Bump to the top of Admin inquiries list
      thread: [...currentThread, newMsg],
    };

    // Remove from previous index and move to top of list
    list.splice(existingIdx, 1);
    list.unshift(updatedEnq);
    saveStoredEnquiries(list);

    // Asynchronously forward to backend API so Admin TiDB Cloud receives it
    try {
      const apiUrl = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";
      fetch(`${apiUrl}/api/auth/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          email: safeEmail,
          phone: item.phone || null,
          program: item.programInterested || "General Guidance",
          message: safeMessage,
        }),
      }).catch(() => {});
    } catch {}

    return updatedEnq;
  }

  // Otherwise, create first enquiry record for this user
  const newEnq: EnquiryItem = {
    ...item,
    id: "enq_" + Date.now(),
    name: safeName,
    email: safeEmail,
    subject: safeSubject,
    message: safeMessage,
    status: "New",
    createdAt: now,
    thread: [
      {
        id: "msg_" + Date.now(),
        sender: "user",
        senderName: safeName,
        text: safeMessage,
        createdAt: now,
      },
    ],
  };
  list.unshift(newEnq);
  saveStoredEnquiries(list);

  // Asynchronously forward to backend API so Admin TiDB Cloud receives it
  try {
    const apiUrl = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";
    fetch(`${apiUrl}/api/auth/enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: safeName,
        email: safeEmail,
        phone: item.phone || null,
        program: item.programInterested || "General Guidance",
        message: safeMessage,
      }),
    }).catch(() => {});
  } catch {}

  return newEnq;
}

export async function fetchUserEnquiries(
  userEmail: string,
  userId?: string
): Promise<EnquiryItem[]> {
  const list = getStoredEnquiries();
  const normalizedEmail = (userEmail || "").trim().toLowerCase();

  return list.filter((e) => {
    if (userId && e.userId && e.userId === userId) return true;
    if (normalizedEmail && e.email && e.email.trim().toLowerCase() === normalizedEmail) return true;
    return false;
  });
}

export interface AdminSendMessagePayload {
  userId?: string | undefined;
  name: string;
  email: string;
  phone?: string | undefined;
  subject: string;
  message: string;
  programInterested?: string | undefined;
}

export async function adminSendMessageToUser(payload: AdminSendMessagePayload): Promise<EnquiryItem> {
  const list = getStoredEnquiries();
  const now = new Date().toISOString();
  const cleanEmail = (payload.email || "").trim().toLowerCase();
  const cleanUid = (payload.userId || "").trim().toLowerCase();
  const safeName = payload.name.trim() || "Seeker";
  const safeSubject = payload.subject.trim() || "Teacher Guidance & Support";
  const safeMessage = payload.message.trim();

  const teacherMsg: EnquiryMessage = {
    id: "msg_" + Date.now(),
    sender: "admin",
    senderName: "Teacher Guidance",
    text: safeMessage,
    createdAt: now,
  };

  // Check if an existing thread exists for this user / email
  const existingIdx = list.findIndex((e) => {
    const eUid = (e.userId || "").trim().toLowerCase();
    const eEmail = (e.email || "").trim().toLowerCase();
    return (cleanUid && eUid && cleanUid === eUid) || (cleanEmail && eEmail && cleanEmail === eEmail);
  });

  if (existingIdx >= 0) {
    const existing = list[existingIdx]!;
    const thread = getEnquiryThread(existing);
    const updated: EnquiryItem = {
      ...existing,
      name: safeName || existing.name,
      phone: payload.phone?.trim() || existing.phone,
      subject: safeSubject || existing.subject,
      programInterested: payload.programInterested || existing.programInterested,
      notes: safeMessage,
      status: "Resolved",
      createdAt: now,
      thread: [...thread, teacherMsg],
    };
    list.splice(existingIdx, 1);
    list.unshift(updated);
    saveStoredEnquiries(list);
    return updated;
  }

  // Otherwise, create a new enquiry record initialized by the Admin
  const effectiveId = payload.userId || ("enq_" + Date.now());
  const newEnq: EnquiryItem = {
    id: effectiveId,
    userId: payload.userId,
    name: safeName,
    email: payload.email.trim(),
    phone: payload.phone?.trim() || undefined,
    subject: safeSubject,
    message: safeMessage,
    programInterested: payload.programInterested || "General Guidance",
    status: "Resolved",
    createdAt: now,
    notes: safeMessage,
    thread: [teacherMsg],
  };

  list.unshift(newEnq);
  saveStoredEnquiries(list);
  return newEnq;
}

