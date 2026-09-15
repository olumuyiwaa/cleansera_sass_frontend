"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useAuth } from "@/app/auth/useAuth";
import { listStaff, inviteStaff, updateStaffRole, removeStaff } from "@/app/api/staff.api";
import { StaffMember, StaffRole, staffDisplayName } from "@/app/api/cleansera-types";

const ROLE_LABEL: Record<StaffRole, string> = {
  BUSINESS_OWNER: "Owner",
  BUSINESS_MANAGER: "Manager",
  ORG_ADMIN: "Org Admin",
};

const ROLE_COLOR: Record<StaffRole, "success" | "warning" | "light"> = {
  BUSINESS_OWNER: "success",
  BUSINESS_MANAGER: "light",
  ORG_ADMIN: "warning",
};

export default function TeamPage() {
  const { user } = useAuth();
  const isOwnerOrOrgAdmin = user?.businessRole === "BUSINESS_OWNER" || user?.businessRole === "ORG_ADMIN";

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "BUSINESS_MANAGER" as StaffRole });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listStaff();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await inviteStaff({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      });
      setShowInviteModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", role: "BUSINESS_MANAGER" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (member: StaffMember, role: StaffRole) => {
    setError("");
    try {
      await updateStaffRole(member.id, role);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemove = async () => {
    if (!showRemoveModal) return;
    setSaving(true);
    setError("");
    try {
      await removeStaff(showRemoveModal.id);
      setShowRemoveModal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove team member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            People who can manage this business — separate from your cleaner roster.
          </p>
        </div>
        {isOwnerOrOrgAdmin && <Button onClick={() => setShowInviteModal(true)}>Invite Teammate</Button>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Role</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>Loading…</TableCell>
                </TableRow>
              )}
              {!loading && members.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>No team members yet</TableCell>
                </TableRow>
              )}
              {!loading &&
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {staffDisplayName(m)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{m.user.email}</TableCell>
                    <TableCell className="px-5 py-4">
                      {isOwnerOrOrgAdmin && m.role !== "BUSINESS_OWNER" && m.isActive ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m, e.target.value as StaffRole)}
                          className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-sm dark:border-gray-700 dark:text-white/90"
                        >
                          <option value="BUSINESS_MANAGER">Manager</option>
                          <option value="ORG_ADMIN">Org Admin</option>
                        </select>
                      ) : (
                        <Badge color={ROLE_COLOR[m.role]} size="sm">{ROLE_LABEL[m.role]}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={m.isActive ? "success" : "light"} size="sm">
                        {m.isActive ? (m.joinedAt ? "Active" : "Invited") : "Removed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {isOwnerOrOrgAdmin && m.role !== "BUSINESS_OWNER" && m.isActive && (
                        <button
                          onClick={() => setShowRemoveModal(m)}
                          className="text-sm font-medium text-error-500 hover:text-error-600"
                        >
                          Remove
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invite modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} className="max-w-md p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Invite a Teammate</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Role</Label>
            <Select
              options={[
                { value: "BUSINESS_MANAGER", label: "Manager — day-to-day access" },
                { value: "ORG_ADMIN", label: "Org Admin — cross-location (franchise parents only)" },
              ]}
              defaultValue={form.role}
              onChange={(value) => setForm({ ...form, role: value as StaffRole })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowInviteModal(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Sending…" : "Send Invite"}</Button>
          </div>
        </form>
      </Modal>

      {/* Remove modal */}
      <Modal isOpen={!!showRemoveModal} onClose={() => setShowRemoveModal(null)} className="max-w-md p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Remove {showRemoveModal ? staffDisplayName(showRemoveModal) : ""}?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          They&apos;ll immediately lose access to this business. This can be undone by inviting them again.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowRemoveModal(null)} type="button">Cancel</Button>
          <Button onClick={handleRemove} disabled={saving}>{saving ? "Removing…" : "Confirm Remove"}</Button>
        </div>
      </Modal>
    </div>
  );
}
