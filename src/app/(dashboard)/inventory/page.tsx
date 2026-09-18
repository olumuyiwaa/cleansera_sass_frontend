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
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import {
    listItems,
    createItem,
    updateItem,
    listLocations,
    createLocation,
    getStock,
    createMovement,
    InventoryItem,
    InventoryLocation,
    InventoryItemType,
    StockMovementType,
} from "@/app/api/inventory.api";

const ITEM_TYPES: InventoryItemType[] = ["SUPPLY", "CHEMICAL", "EQUIPMENT", "PPE", "OTHER"];
const MOVEMENT_TYPES: { value: StockMovementType; label: string }[] = [
    { value: "PURCHASE", label: "Purchase / Receive" },
    { value: "USAGE", label: "Usage" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "RETURN", label: "Return" },
    { value: "WRITE_OFF", label: "Write-off" },
];

const TYPE_COLOR: Record<InventoryItemType, "success" | "warning" | "error" | "light" | "info"> = {
    SUPPLY: "info",
    CHEMICAL: "warning",
    EQUIPMENT: "success",
    PPE: "light",
    OTHER: "light",
};

export default function InventoryPage() {
    const [tab, setTab] = useState<"items" | "stock" | "locations">("items");
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stock, setStock] = useState<InventoryItem[]>([]);
    const [locations, setLocations] = useState<InventoryLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState<InventoryItemType | "ALL">("ALL");
    const [lowStockOnly, setLowStockOnly] = useState(false);

    const [showItemModal, setShowItemModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [itemForm, setItemForm] = useState({
        name: "",
        sku: "",
        type: "SUPPLY" as InventoryItemType,
        unit: "each",
        reorderPoint: "",
        isHazardous: false,
        manufacturer: "",
    });

    const [locationForm, setLocationForm] = useState({
        name: "",
        type: "WAREHOUSE",
        address: "",
    });

    const [movementForm, setMovementForm] = useState({
        itemId: "",
        type: "PURCHASE" as StockMovementType,
        quantity: "",
        fromLocationId: "",
        toLocationId: "",
        notes: "",
    });

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listItems({
                type: typeFilter === "ALL" ? undefined : typeFilter,
            });
            // Previously `data.items || data as any` — a defensive workaround
            // for listItems() returning the raw {success,data} envelope
            // instead of its unwrapped payload. Now that inventory.api.ts
            // unwraps .data itself, `data` really is the {items, total, ...}
            // shape the type declares, so the fallback is gone.
            setItems(data.items || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load items");
        } finally {
            setLoading(false);
        }
    }, [typeFilter]);

    const loadStock = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getStock({ lowStock: lowStockOnly || undefined });
            setStock(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load stock");
        } finally {
            setLoading(false);
        }
    }, [lowStockOnly]);

    const loadLocations = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listLocations();
            setLocations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load locations");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "items") loadItems();
        else if (tab === "stock") loadStock();
        else loadLocations();
    }, [tab, loadItems, loadStock, loadLocations]);

    // Also load locations for movement modal dropdowns
    useEffect(() => {
        listLocations().then(setLocations).catch(() => {});
    }, []);

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createItem({
                name: itemForm.name,
                sku: itemForm.sku || undefined,
                type: itemForm.type,
                unit: itemForm.unit || "each",
                reorderPoint: itemForm.reorderPoint ? Number(itemForm.reorderPoint) : undefined,
                isHazardous: itemForm.isHazardous,
                manufacturer: itemForm.manufacturer || undefined,
            });
            setShowItemModal(false);
            setItemForm({ name: "", sku: "", type: "SUPPLY", unit: "each", reorderPoint: "", isHazardous: false, manufacturer: "" });
            await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create item");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createLocation({
                name: locationForm.name,
                type: locationForm.type,
                address: locationForm.address || undefined,
            });
            setShowLocationModal(false);
            setLocationForm({ name: "", type: "WAREHOUSE", address: "" });
            await loadLocations();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create location");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createMovement({
                itemId: movementForm.itemId,
                type: movementForm.type,
                quantity: Number(movementForm.quantity),
                fromLocationId: movementForm.fromLocationId || undefined,
                toLocationId: movementForm.toLocationId || undefined,
                notes: movementForm.notes || undefined,
            });
            setShowMovementModal(false);
            setMovementForm({ itemId: "", type: "PURCHASE", quantity: "", fromLocationId: "", toLocationId: "", notes: "" });
            if (tab === "stock") await loadStock();
            else await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to record movement");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (item: InventoryItem) => {
        try {
            await updateItem(item.id, { isActive: !item.isActive });
            await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update item");
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Inventory</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track supplies, chemicals, equipment and stock levels across locations.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setShowMovementModal(true)}>
                        Record Movement
                    </Button>
                    {tab === "locations" ? (
                        <Button onClick={() => setShowLocationModal(true)}>Add Location</Button>
                    ) : (
                        <Button onClick={() => setShowItemModal(true)}>Add Item</Button>
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
                {(["items", "stock", "locations"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            tab === t
                                ? "bg-brand-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
                        }`}
                    >
                        {t === "items" ? "Items" : t === "stock" ? "Stock Levels" : "Locations"}
                    </button>
                ))}
            </div>

            {/* Type filter (items tab) */}
            {tab === "items" && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {(["ALL", ...ITEM_TYPES] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                typeFilter === t
                                    ? "bg-brand-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
                            }`}
                        >
                            {t === "ALL" ? "All types" : t}
                        </button>
                    ))}
                </div>
            )}

            {/* Low stock toggle (stock tab) */}
            {tab === "stock" && (
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={lowStockOnly}
                            onChange={(e) => setLowStockOnly(e.target.checked)}
                            className="rounded"
                        />
                        Show low-stock items only
                    </label>
                </div>
            )}

            {/* ─── Items table ───────────────────────────────────── */}
            {tab === "items" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">SKU</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Unit</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Reorder</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Status</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={7}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={7}>No items yet</TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {item.name}
                                                {item.isHazardous && (
                                                    <span className="ml-2 text-xs text-warning-500">⚠ Hazardous</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{item.sku || "—"}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge color={TYPE_COLOR[item.type]} size="sm">{item.type}</Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{item.unit}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {item.reorderPoint ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge color={item.isActive ? "success" : "light"} size="sm">
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <RowActionsMenu
                                                    label={`Actions for ${item.name}`}
                                                    actions={[
                                                        {
                                                            label: item.isActive ? "Deactivate" : "Activate",
                                                            variant: item.isActive ? "danger" as const : "default" as const,
                                                            onClick: () => toggleActive(item),
                                                        },
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Stock table ───────────────────────────────────── */}
            {tab === "stock" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Item</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Total Qty</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Reorder Pt</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Status</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Locations</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && stock.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={6}>No stock data</TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    stock.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge color={TYPE_COLOR[item.type]} size="sm">{item.type}</Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                                {item.totalQuantity ?? 0} {item.unit}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {item.reorderPoint ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                {item.isLowStock ? (
                                                    <Badge color="error" size="sm">Low stock</Badge>
                                                ) : (
                                                    <Badge color="success" size="sm">OK</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {(item.stockLevels || [])
                                                    .map((s) => `${s.location.name}: ${s.quantity}`)
                                                    .join(", ") || "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Locations table ───────────────────────────────── */}
            {tab === "locations" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Address</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500">Items in stock</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>Loading…</TableCell>
                                    </TableRow>
                                )}
                                {!loading && locations.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500" colSpan={4}>No locations yet</TableCell>
                                    </TableRow>
                                )}
                                {!loading &&
                                    locations.map((loc) => (
                                        <TableRow key={loc.id}>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                {loc.name}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{loc.type}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">{loc.address || "—"}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500">
                                                {loc.stockLevels?.length ?? 0}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ─── Create Item Modal ─────────────────────────────── */}
            <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} className="max-w-md p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Add Inventory Item</h2>
                <form onSubmit={handleCreateItem} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>SKU</Label>
                            <Input value={itemForm.sku} onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })} />
                        </div>
                        <div>
                            <Label>Unit</Label>
                            <Input value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} placeholder="each, liter, box…" />
                        </div>
                    </div>
                    <div>
                        <Label>Type</Label>
                        <select
                            value={itemForm.type}
                            onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as InventoryItemType })}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            {ITEM_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Reorder Point</Label>
                        <Input type="number" min="0" value={itemForm.reorderPoint} onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })} />
                    </div>
                    <div>
                        <Label>Manufacturer</Label>
                        <Input value={itemForm.manufacturer} onChange={(e) => setItemForm({ ...itemForm, manufacturer: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={itemForm.isHazardous}
                            onChange={(e) => setItemForm({ ...itemForm, isHazardous: e.target.checked })}
                            className="rounded"
                        />
                        Hazardous chemical (requires SDS)
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowItemModal(false)} type="button">Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            {/* ─── Create Location Modal ─────────────────────────── */}
            <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} className="max-w-md p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Add Location</h2>
                <form onSubmit={handleCreateLocation} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={locationForm.name} onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} required placeholder="Main Warehouse, Van 1…" />
                    </div>
                    <div>
                        <Label>Type</Label>
                        <select
                            value={locationForm.type}
                            onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="WAREHOUSE">Warehouse</option>
                            <option value="VEHICLE">Vehicle</option>
                            <option value="SITE">Site</option>
                        </select>
                    </div>
                    <div>
                        <Label>Address (optional)</Label>
                        <Input value={locationForm.address} onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowLocationModal(false)} type="button">Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            {/* ─── Movement Modal ────────────────────────────────── */}
            <Modal isOpen={showMovementModal} onClose={() => setShowMovementModal(false)} className="max-w-md p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Record Stock Movement</h2>
                <form onSubmit={handleCreateMovement} className="space-y-4">
                    <div>
                        <Label>Item</Label>
                        <select
                            value={movementForm.itemId}
                            onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                            required
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="">Select item…</option>
                            {items.map((i) => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Type</Label>
                        <select
                            value={movementForm.type}
                            onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as StockMovementType })}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            {MOVEMENT_TYPES.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Quantity</Label>
                        <Input type="number" min="1" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} required />
                    </div>
                    {["USAGE", "WRITE_OFF", "TRANSFER"].includes(movementForm.type) && (
                        <div>
                            <Label>From Location</Label>
                            <select
                                value={movementForm.fromLocationId}
                                onChange={(e) => setMovementForm({ ...movementForm, fromLocationId: e.target.value })}
                                required
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">Select…</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {["PURCHASE", "RETURN", "TRANSFER", "ADJUSTMENT"].includes(movementForm.type) && (
                        <div>
                            <Label>To Location</Label>
                            <select
                                value={movementForm.toLocationId}
                                onChange={(e) => setMovementForm({ ...movementForm, toLocationId: e.target.value })}
                                required={movementForm.type !== "ADJUSTMENT"}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">Select…</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <Label>Notes</Label>
                        <Input value={movementForm.notes} onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowMovementModal(false)} type="button">Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Record"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}