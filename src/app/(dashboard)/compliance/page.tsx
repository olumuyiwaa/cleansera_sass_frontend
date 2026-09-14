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
import {
    listDocuments,
    createDocument,
    deleteDocument,
    listAudits,
    createAudit,
    updateAudit,
    listTrainingAcks,
    ComplianceDocument,
    ComplianceAudit,
    ComplianceDocType,
    ChemicalTrainingAck,
} from "@/app/api/compliance.api";

const DOC_TYPES: ComplianceDocType[] = [
    "SDS",
    "RISK_ASSESSMENT",
    "COSHH_ASSESSMENT",
    "TRAINING_RECORD",
    "INSPECTION_REPORT",
    "CERTIFICATE",
    "OTHER",
];

const DOC_TYPE_LABEL: Record<ComplianceDocType, string> = {
    SDS: "Safety Data Sheet",
    RISK_ASSESSMENT: "Risk Assessment",
    COSHH_ASSESSMENT: "COSHH Assessment",
    TRAINING_RECORD: "Training Record",
    INSPECTION_REPORT: "Inspection Report",
    CERTIFICATE: "Certificate",
    OTHER: "Other",
};

export default function CompliancePage() {
    const [tab, setTab] = useState<"documents" | "audits" | "training">("documents");
    const [docs, setDocs] = useState<ComplianceDocument[]>([]);
    const [audits, setAudits] = useState<ComplianceAudit[]>([]);
    const [acks, setAcks] = useState<ChemicalTrainingAck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState<ComplianceDocType | "ALL">("ALL");
    const [expiringSoon, setExpiringSoon] = useState(false);

    const [showDocModal, setShowDocModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [docForm, setDocForm] = useState({
        type: "SDS" as ComplianceDocType,
        title: "",
        storageKey: "",
        version: "",
        expiresAt: "",
        notes: "",
    });

    const [auditForm, setAuditForm] = useState({
        title: "",
        type: "INTERNAL",
        conductedAt: new Date().toISOString().slice(0, 10),
        score: "",
        notes: "",
    });

    const loadDocs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listDocuments({
                type: typeFilter === "ALL" ? undefined : typeFilter,
                expiringSoon: expiringSoon || undefined,
            });
            setDocs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, [typeFilter, expiringSoon]);

    const loadAudits = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listAudits();
            setAudits(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load audits");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAcks = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listTrainingAcks();
            setAcks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load training records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "documents") loadDocs();
        else if (tab === "audits") loadAudits();
        else loadAcks();
    }, [tab, loadDocs, loadAudits, loadAcks]);

    const handleCreateDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            // In production you would upload the file first via /storage and get a storageKey.
            // For now we accept a storageKey string (or a placeholder).
            await createDocument({
                type: docForm.type,
                title: docForm.title,
                storageKey: docForm.storageKey || `pending/${Date.now()}`,
                version: docForm.version || undefined,
                expiresAt: docForm.expiresAt || undefined,
                notes: docForm.notes || undefined,
            });
            setShowDocModal(false);
            setDocForm({ type: "SDS", title: "", storageKey: "", version: "", expiresAt: "", notes: "" });
            await loadDocs();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create document");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        if (!confirm("Delete this document? Linked inventory items will lose their SDS reference.")) return;
        try {
            await deleteDocument(id);
            await loadDocs();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    const handleCreateAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createAudit({
                title: auditForm.title,
                type: auditForm.type,
                conductedAt: new Date(auditForm.conductedAt).toISOString(),
                score: auditForm.score ? Number(auditForm.score) : undefined,
                notes: auditForm.notes || undefined,
            });
            setShowAuditModal(false);
            setAuditForm({ title: "", type: "INTERNAL", conductedAt: new Date().toISOString().slice(0, 10), score: "", notes: "" });
            await loadAudits();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create audit");
        } finally {
            setSaving(false);
        }
    };

    const closeAudit = async (audit: ComplianceAudit) => {
        try {
            await updateAudit(audit.id, { status: "CLOSED" });
            await loadAudits();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update audit");
        }
    };

    const isExpiringSoon = (expiresAt?: string | null) => {
        if (!expiresAt) return false;
        const d = new Date(expiresAt);
        const in30 = new Date();
        in30.setDate(in30.getDate() + 30);
        return d <= in30 && d >= new Date();
    };

    const isExpired = (expiresAt?: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Compliance</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        SDS library, chemical training acknowledgements, and compliance audits.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tab === "documents" && (
                        <Button onClick={() => setShowDocModal(true)}>Add Document</Button>
                    )}
                    {tab === "audits" && (
                        <Button onClick={() => setShowAuditModal(true)}>New Audit</Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
                {(["documents", "audits", "training"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            tab === t
                                ? "bg-brand-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
                        }`}
                    >
                        {t === "documents" ? "Documents / SDS" : t === "audits" ? "Audits" : "Training Acks"}
                    </button>
                ))}
            </div>

            {/* Document filters */}
            {tab === "documents" && (
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    {(["ALL", ...DOC_TYPES] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                typeFilter === t
                                    ? "bg-brand-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
                            }`}
                        >
                            {t === "ALL" ? "All" : DOC_TYPE_LABEL[t]}
                        </button>
                    ))}
                    <label className="ml-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={expiringSoon}
                            onChange={(e) => setExpiringSoon(e.target.checked)}
                            className="rounded"
                        />
                        Expiring in 30 days
                    </label>
                </div>
            )}

            {/* ─── Documents table ───────────────────────────────── */}
            {tab === "documents" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Title</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Version</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Expires</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && docs.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={5}>No documents yet</TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    docs.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {doc.title}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {DOC_TYPE_LABEL[doc.type] || doc.type}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{doc.version || "—"}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm">
                                                {doc.expiresAt ? (
                                                    <span className={
                                                        isExpired(doc.expiresAt)
                                                            ? "text-error-500"
                                                            : isExpiringSoon(doc.expiresAt)
                                                                ? "text-warning-500"
                                                                : "text-gray-500"
                                                    }>
                            {new Date(doc.expiresAt).toLocaleDateString()}
                                                        {isExpired(doc.expiresAt) && " (expired)"}
                                                        {isExpiringSoon(doc.expiresAt) && " (soon)"}
                          </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <button
                                                    onClick={() => handleDeleteDoc(doc.id)}
                                                    className="text-sm font-medium text-error-500 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Audits table ──────────────────────────────────── */}
            {tab === "audits" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Title</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Date</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Score</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Status</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && audits.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>No audits yet</TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    audits.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {a.title}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{a.type}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {new Date(a.conductedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {a.score != null ? `${a.score}/100` : "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    color={a.status === "CLOSED" ? "success" : a.status === "IN_PROGRESS" ? "warning" : "info"}
                                                    size="sm"
                                                >
                                                    {a.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                {a.status !== "CLOSED" && (
                                                    <button
                                                        onClick={() => closeAudit(a)}
                                                        className="text-sm font-medium text-brand-500 hover:underline"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Training acks table ───────────────────────────── */}
            {tab === "training" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Cleaner</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Document ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Acknowledged</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Notes</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && acks.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>
                                            No training acknowledgements yet. Cleaners can acknowledge SDS docs from the mobile app.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    acks.map((ack) => (
                                        <TableRow key={ack.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {ack.cleaner
                                                    ? `${ack.cleaner.user.firstName} ${ack.cleaner.user.lastName}`
                                                    : ack.cleanerId}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500 font-mono text-xs">
                                                {ack.documentId.slice(0, 12)}…
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {new Date(ack.acknowledgedAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{ack.notes || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Add Document Modal ────────────────────────────── */}
            <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} className="max-w-md p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Add Compliance Document</h2>
                <form onSubmit={handleCreateDoc} className="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <select
                            value={docForm.type}
                            onChange={(e) => setDocForm({ ...docForm, type: e.target.value as ComplianceDocType })}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            {DOC_TYPES.map((t) => (
                                <option key={t} value={t}>{DOC_TYPE_LABEL[t]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Title</Label>
                        <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} required placeholder="e.g. SDS – All-Purpose Cleaner" />
                    </div>
                    <div>
                        <Label>Storage Key / File path</Label>
                        <Input
                            value={docForm.storageKey}
                            onChange={(e) => setDocForm({ ...docForm, storageKey: e.target.value })}
                            placeholder="Upload via Storage first, then paste key"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Upload the PDF via the Storage module first, then paste the returned key here.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Version</Label>
                            <Input value={docForm.version} onChange={(e) => setDocForm({ ...docForm, version: e.target.value })} placeholder="2025-03" />
                        </div>
                        <div>
                            <Label>Expires</Label>
                            <Input type="date" value={docForm.expiresAt} onChange={(e) => setDocForm({ ...docForm, expiresAt: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label>Notes</Label>
                        <Input value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowDocModal(false)} type="button">Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            {/* ─── New Audit Modal ───────────────────────────────── */}
            <Modal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} className="max-w-md p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">New Compliance Audit</h2>
                <form onSubmit={handleCreateAudit} className="space-y-4">
                    <div>
                        <Label>Title</Label>
                        <Input value={auditForm.title} onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })} required placeholder="Q1 Internal SDS Review" />
                    </div>
                    <div>
                        <Label>Type</Label>
                        <select
                            value={auditForm.type}
                            onChange={(e) => setAuditForm({ ...auditForm, type: e.target.value })}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="INTERNAL">Internal</option>
                            <option value="OSHA_INSPECTION">OSHA Inspection</option>
                            <option value="CLIENT">Client Audit</option>
                            <option value="SDS_REVIEW">SDS Review</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date</Label>
                            <Input type="date" value={auditForm.conductedAt} onChange={(e) => setAuditForm({ ...auditForm, conductedAt: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Score (0–100)</Label>
                            <Input type="number" min="0" max="100" value={auditForm.score} onChange={(e) => setAuditForm({ ...auditForm, score: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label>Notes</Label>
                        <Input value={auditForm.notes} onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowAuditModal(false)} type="button">Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}