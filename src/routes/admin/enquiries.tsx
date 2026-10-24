import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Mail,
  Phone,
  Eye,
  X,
  ExternalLink,
  Inbox,
  Send,
  MessageCircle,
  ChevronDown,
  MessageSquarePlus,
  User,
  Plus,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  fetchAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryThread,
  addEnquiryMessage,
  adminSendMessageToUser,
  subscribeToEnquiries,
  type EnquiryItem,
  type EnquiryMessage,
} from "@/lib/enquiries-api";
import { fetchAllUsers, type SeekerItem } from "@/lib/users-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/enquiries")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // New Message to User Modal State
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<SeekerItem[]>([]);
  const [newMsgEmail, setNewMsgEmail] = useState("");
  const [newMsgText, setNewMsgText] = useState("");
  const [sendingNewMsg, setSendingNewMsg] = useState(false);

  useEffect(() => {
    setReplyText("");
  }, [selectedEnquiry?.id]);

  useEffect(() => {
    const refreshData = () => {
      fetchAllEnquiries().then((data) => {
        setEnquiries(data);
        setLoading(false);
        // Live sync selectedEnquiry if modal is currently open!
        setSelectedEnquiry((prev) => {
          if (!prev) return null;
          const fresh = data.find(
            (e) =>
              e.id === prev.id ||
              (e.userId && prev.userId && e.userId === prev.userId) ||
              (e.email && prev.email && e.email.toLowerCase() === prev.email.toLowerCase())
          );
          return fresh ? fresh : prev;
        });
      });
    };

    refreshData();
    const unsubscribe = subscribeToEnquiries(refreshData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAllUsers().then((users) => {
      setRegisteredUsers(users);
    });
  }, []);

  const handleSendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newMsgEmail.trim().toLowerCase();
    if (!cleanEmail) {
      showAlert.error("Recipient Email Required", "Please enter the user's email address.");
      return;
    }
    if (!newMsgText.trim()) {
      showAlert.error("Message Required", "Please type your message.");
      return;
    }

    setSendingNewMsg(true);
    try {
      const matched = registeredUsers.find(
        (u) => (u.email || "").trim().toLowerCase() === cleanEmail
      );

      const recipientName = matched?.name || cleanEmail.split("@")[0] || "Seeker";
      const recipientId = matched?.id || undefined;
      const program = matched?.program || "Teacher Guidance & Direct Message";

      const sent = await adminSendMessageToUser({
        userId: recipientId,
        name: recipientName,
        email: cleanEmail,
        phone: matched?.phone || undefined,
        subject: "Direct Message from Admin / Teacher",
        message: newMsgText.trim(),
        programInterested: program,
      });

      showAlert.success(
        "Message Sent!",
        `Message sent to ${cleanEmail}. The seeker will see it on their user page.`,
        2500
      );

      const freshList = await fetchAllEnquiries();
      setEnquiries(freshList);
      setShowNewMsgModal(false);
      setNewMsgEmail("");
      setNewMsgText("");
      setSelectedEnquiry(sent);
    } catch (err) {
      console.error(err);
      showAlert.error("Failed to Send", "Could not send message. Please try again.");
    } finally {
      setSendingNewMsg(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const searchLower = (searchTerm || "").toLowerCase().trim();
    const nameStr = (e.name || "").toLowerCase();
    const emailStr = (e.email || "").toLowerCase();
    const phoneStr = (e.phone || "").toLowerCase();
    const subjectStr = (e.subject || "").toLowerCase();
    const messageStr = (e.message || "").toLowerCase();
    const programStr = (e.programInterested || "").toLowerCase();
    const statusStr = (e.status || "").toLowerCase();

    const matchesSearch =
      !searchLower ||
      nameStr.includes(searchLower) ||
      emailStr.includes(searchLower) ||
      phoneStr.includes(searchLower) ||
      subjectStr.includes(searchLower) ||
      messageStr.includes(searchLower) ||
      programStr.includes(searchLower);

    const matchesStatus =
      statusFilter === "All" || statusStr === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const newCount = enquiries.filter((e) => e.status === "New").length;
  const inProgressCount = enquiries.filter((e) => e.status === "In Progress").length;
  const resolvedCount = enquiries.filter((e) => e.status === "Resolved").length;

  const handleStatusChange = async (enquiry: EnquiryItem, newStatus: EnquiryItem["status"]) => {
    await updateEnquiryStatus(enquiry.id, newStatus);
    showAlert.success("Updated", `Status changed to ${newStatus}.`, 1200);
    const freshList = await fetchAllEnquiries();
    setEnquiries(freshList);
    if (
      selectedEnquiry &&
      (selectedEnquiry.id === enquiry.id ||
        (selectedEnquiry.userId && enquiry.userId && selectedEnquiry.userId === enquiry.userId) ||
        (selectedEnquiry.email && enquiry.email && selectedEnquiry.email.toLowerCase() === enquiry.email.toLowerCase()))
    ) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  const handleSendReply = async () => {
    if (!selectedEnquiry || !replyText.trim()) return;
    const messageToSend = replyText.trim();
    setSendingReply(true);
    try {
      const updated = await addEnquiryMessage(selectedEnquiry.id, "admin", messageToSend);
      showAlert.success("Reply Sent!", `Teacher guidance sent to ${selectedEnquiry.name} and marked as Resolved.`, 2000);
      const freshList = await fetchAllEnquiries();
      setEnquiries(freshList);
      if (updated) {
        setSelectedEnquiry(updated);
      }
      setReplyText("");
    } catch (err) {
      console.error(err);
      showAlert.error("Error", "Could not send reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (enquiry: EnquiryItem) => {
    const confirm = await showAlert.confirm(
      "Delete Enquiry?",
      `Are you sure you want to permanently delete the inquiry from "${enquiry.name}"?`,
      "Yes, delete"
    );
    if (confirm.isConfirmed) {
      await deleteEnquiry(enquiry.id);
      const freshList = await fetchAllEnquiries();
      setEnquiries(freshList);
      if (
        selectedEnquiry &&
        (selectedEnquiry.id === enquiry.id ||
          (selectedEnquiry.userId && enquiry.userId && selectedEnquiry.userId === enquiry.userId) ||
          (selectedEnquiry.email && enquiry.email && selectedEnquiry.email.toLowerCase() === enquiry.email.toLowerCase()))
      ) {
        setSelectedEnquiry(null);
      }
      showAlert.success("Deleted", "Inquiry removed successfully.", 1200);
    }
  };

  const getStatusBadge = (status: EnquiryItem["status"]) => {
    switch (status) {
      case "New":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-blue-600 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            New
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-600 border border-amber-200">
            <Clock className="size-3" />
            In Progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Contact Enquiries & Messages
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Questions, seeker consultation requests, and direct teacher guidance communications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="admin-new-message-button"
            onClick={() => {
              setNewMsgEmail("");
              setNewMsgText("");
              setShowNewMsgModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334d84] hover:bg-[#253961] text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Send className="size-3.5 text-amber-300" />
            <span>Send Message to User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">New Inquiries</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{newCount}</p>
            <p className="text-[0.68rem] text-gray-500 mt-0.5">Awaiting first reply</p>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
            <p className="text-[0.68rem] text-gray-500 mt-0.5">Under guidance conversation</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            <p className="text-[0.68rem] text-gray-500 mt-0.5">Successfully answered</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Dropdown Option */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
              <Filter className="size-3.5 text-gray-400" />
              Status:
            </span>
            <div className="relative min-w-[170px]">
              <select
                id="enquiry-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-gray-50/80 hover:bg-white focus:bg-white text-gray-800 shadow-2xs hover:border-gray-300 focus:outline-none focus:border-[#334d84] transition-colors cursor-pointer"
              >
                <option value="All">All Inquiries ({enquiries.length})</option>
                <option value="New">New ({newCount})</option>
                <option value="In Progress">In Progress ({inProgressCount})</option>
                <option value="Resolved">Resolved ({resolvedCount})</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search seeker name, email, query..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84]"
            />
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Seeker ID</th>
                <th className="py-3 px-4">Seeker Details</th>
                <th className="py-3 px-4">Subject & Thread Messages</th>
                <th className="py-3 px-4">Program Interest</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const thread = getEnquiryThread(enq);
                  const seekerId = enq.userId || enq.id;
                  const lastMsg = thread[thread.length - 1];
                  const isAnsweredByAdmin =
                    enq.status === "Resolved" || (lastMsg && lastMsg.sender === "admin");

                  let pendingUserMessagesCount = 0;
                  if (!isAnsweredByAdmin) {
                    for (let i = thread.length - 1; i >= 0; i--) {
                      if (thread[i]?.sender === "admin") break;
                      if (thread[i]?.sender === "user") pendingUserMessagesCount++;
                    }
                    if (pendingUserMessagesCount === 0 && enq.status !== "Resolved") {
                      pendingUserMessagesCount = 1;
                    }
                  }

                  return (
                    <tr key={enq.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[0.72rem] font-bold text-[#334d84] bg-[#334d84]/10 px-2 py-0.5 rounded border border-[#334d84]/20 inline-block">
                          {seekerId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{enq.name}</p>
                        <p className="text-[0.68rem] text-gray-400">{enq.email}</p>
                        {enq.userId && (
                          <span className="inline-block mt-0.5 text-[0.6rem] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Registered Sadhaka
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-gray-800 truncate">{enq.subject}</p>
                        <p className="text-[0.68rem] text-gray-500 line-clamp-1 mt-0.5">{enq.message}</p>
                        {pendingUserMessagesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1">
                            <span className="size-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            {pendingUserMessagesCount} {pendingUserMessagesCount === 1 ? "message" : "messages"} awaiting reply
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                            <CheckCircle2 className="size-2.5 text-emerald-600" />
                            Guidance replied by teacher
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-[0.68rem]">
                          {enq.programInterested || "General Guidance"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(enq.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              setReplyText("");
                              setTimeout(() => {
                                replyInputRef.current?.focus();
                              }, 150);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#334d84] text-white hover:bg-[#253961] font-semibold text-xs transition-all shadow-xs active:scale-98 cursor-pointer"
                            title="Open conversation and send teacher guidance / message"
                          >
                            <Send className="size-3" />
                            <span>Reply / Message</span>
                            {pendingUserMessagesCount > 0 && (
                              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-[#1a2b4c] text-[0.62rem] font-bold">
                                {pendingUserMessagesCount}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(enq)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete enquiry"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry View Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#334d84] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-5 text-gold" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">Seeker Inquiry Details</h3>
                    <span className="font-mono text-[0.65rem] bg-white/20 text-white px-2 py-0.5 rounded font-bold border border-white/30">
                      ID: {selectedEnquiry.userId || selectedEnquiry.id}
                    </span>
                  </div>
                  <p className="text-xs text-white/70">
                    Latest activity on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Seeker Contact Info Card */}
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-bold text-sm text-gray-900">{selectedEnquiry.name}</span>
                  {getStatusBadge(selectedEnquiry.status)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="size-3.5 text-gray-400" />
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-[#334d84] hover:underline font-medium">
                    {selectedEnquiry.email}
                  </a>
                </div>
                {selectedEnquiry.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="size-3.5 text-gray-400" />
                    <span>{selectedEnquiry.phone}</span>
                  </div>
                )}
                {selectedEnquiry.programInterested && (
                  <div className="text-[0.68rem] text-gray-500 pt-1 flex items-center justify-between">
                    <span>Interested Program: <span className="font-semibold text-gray-800">{selectedEnquiry.programInterested}</span></span>
                    <span className="font-mono text-[0.65rem] font-bold text-[#334d84] bg-[#334d84]/10 px-1.5 py-0.5 rounded">
                      ID: {selectedEnquiry.userId || selectedEnquiry.id}
                    </span>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="pb-1 border-b border-gray-100">
                <p className="text-[0.68rem] font-bold text-gray-400 uppercase tracking-wider">Subject</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedEnquiry.subject}</p>
              </div>

              {/* Sequential Conversation Thread for this ID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <span>All Messages from ID: {selectedEnquiry.userId || selectedEnquiry.id} ({getEnquiryThread(selectedEnquiry).length})</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {getEnquiryThread(selectedEnquiry).map((msg, idx) => (
                    msg.sender === "user" ? (
                      <div
                        key={msg.id || idx}
                        className="rounded-xl border border-gray-200 p-3.5 bg-gray-50/90 text-gray-800 space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[0.68rem] border-b border-gray-200/60 pb-1.5 mb-1.5">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-blue-600"></span>
                            {idx === 0 ? `${selectedEnquiry.name} (Original Question)` : `${selectedEnquiry.name} (User Follow-up)`}
                          </span>
                          <span className="text-gray-400">
                            {new Date(msg.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-700">{msg.text}</p>
                      </div>
                    ) : (
                      <div
                        key={msg.id || idx}
                        className="rounded-xl border border-emerald-200 p-3.5 bg-emerald-50/80 text-emerald-950 space-y-1 ml-4 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[0.68rem] border-b border-emerald-200/60 pb-1.5 mb-1.5">
                          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-600"></span>
                            Teacher Guidance Sent:
                          </span>
                          <span className="text-emerald-700/70">
                            {new Date(msg.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap text-emerald-950 font-medium">
                          {msg.text}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Send Reply to User */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Send Reply Message to User
                  </label>
                  {selectedEnquiry.status === "Resolved" && (
                    <span className="text-[0.65rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Resolved
                    </span>
                  )}
                </div>

                <textarea
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Type your response or spiritual guidance for this student..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84] focus:ring-1 focus:ring-[#334d84] transition-all leading-relaxed"
                />

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#334d84] hover:bg-[#253961] text-white font-semibold text-xs transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>{sendingReply ? "Sending..." : "Send Reply & Mark Resolved"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer with direct reply action */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Re: ${encodeURIComponent(selectedEnquiry.subject)}&body=Dear ${encodeURIComponent(selectedEnquiry.name)},%0D%0A%0D%0AThank you for reaching out to THE KRIYA LAB.%0D%0A%0D%0A`}
                onClick={async () => {
                  if (selectedEnquiry) {
                    await addEnquiryMessage(selectedEnquiry.id, "admin", "Guidance replied to seeker via email.");
                    const freshList = await fetchAllEnquiries();
                    setEnquiries(freshList);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#334d84] text-white hover:bg-[#283e6b] font-semibold text-xs transition-colors shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Reply via Email</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-xs text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose New Message to User Modal */}
      {showNewMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#334d84] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Send className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Send Message to User</h3>
                  <p className="text-xs text-white/70">
                    Initiate teacher guidance or send a message directly to any seeker.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMsgModal(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form: Just Email and Content as requested */}
            <form onSubmit={handleSendNewMessage} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {/* User Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-700">
                    User Email Address *
                  </label>
                  {registeredUsers.some(
                    (u) => (u.email || "").trim().toLowerCase() === (newMsgEmail || "").trim().toLowerCase()
                  ) && (
                    <span className="text-[0.65rem] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Registered Seeker
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    list="registered-seekers-emails"
                    value={newMsgEmail}
                    onChange={(e) => setNewMsgEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84] font-medium transition-colors"
                  />
                  <datalist id="registered-seekers-emails">
                    {registeredUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name} (ID: {u.id})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-700">
                    Message Content *
                  </label>
                  <span className="text-[0.65rem] text-gray-400">Will be sent directly to user's page</span>
                </div>

                <textarea
                  required
                  rows={5}
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  placeholder="Type your message or teacher guidance for this user..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84] focus:ring-1 focus:ring-[#334d84] transition-all leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewMsgModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNewMsg || !newMsgEmail.trim() || !newMsgText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#334d84] hover:bg-[#253961] text-white font-semibold text-xs shadow-xs active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>{sendingNewMsg ? "Sending Message..." : "Send Message to User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
