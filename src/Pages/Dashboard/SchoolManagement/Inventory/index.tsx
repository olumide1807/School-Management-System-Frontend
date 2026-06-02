import { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, Chip } from "@mui/material";
import { Add, Search, TrendingUp, TrendingDown } from "@mui/icons-material";
import Modal from "../../../../Components/Modals";
import MessageModal from "../../../../Components/Modals/MessageModal";
import TableComponent from "../../../../Components/Tables";
import EmptyTable from "../../../../Components/EmptyTable";
import SERVER from "../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../Utils/toastOptions";
import Loader from "../../../loaders/Loader";

const CATEGORIES = [
  "Stationery", "Furniture", "Electronics", "Sports Equipment",
  "Cleaning Supplies", "Food & Kitchen", "Books & Learning Materials",
  "First Aid", "Uniforms", "Other"
];

const MOVEMENT_TYPES = [
  { value: "restock", label: "Restock", adds: true, color: "green" },
  { value: "consumed", label: "Consumed / Used", adds: false, color: "blue" },
  { value: "damaged", label: "Damaged", adds: false, color: "orange" },
  { value: "lost", label: "Lost / Stolen", adds: false, color: "red" },
  { value: "returned", label: "Returned to Supplier", adds: false, color: "gray" }
];

const movementBadgeColor = (type: string) => {
  const t = MOVEMENT_TYPES.find((m) => m.value === type);
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700"
  };
  return map[t?.color || "gray"];
};

interface InventoryItem {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  quantity: number;
  minQuantity?: number;
  price: number;
  supplier?: string;
  dateBought?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

interface StockMovement {
  _id: string;
  type: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  note?: string;
  recordedByName?: string;
  createdAt: string;
}

export default function Inventory() {
  const queryClient = useQueryClient();

  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openMovement, setOpenMovement] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [itemToView, setItemToView] = useState<InventoryItem | null>(null);
  const [itemForMovement, setItemForMovement] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Add/Edit form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formMinQuantity, setFormMinQuantity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formDateBought, setFormDateBought] = useState("");

  // Stock movement form state
  const [moveType, setMoveType] = useState("restock");
  const [moveQuantity, setMoveQuantity] = useState("");
  const [moveNote, setMoveNote] = useState("");

  // Queries
  const { data: inventoryData, isPending } = useQuery({
    queryKey: ["all-inventory"],
    queryFn: async () => {
      const res = await SERVER.get("inventory");
      return res?.data;
    },
    retry: false,
  });
  const items: InventoryItem[] = inventoryData?.data || [];

  // Fetch movement history for the item being viewed
  const { data: movementsData } = useQuery({
    queryKey: ["stock-movements", itemToView?._id],
    queryFn: async () => {
      const res = await SERVER.get(`inventory/${itemToView?._id}/movements`);
      return res?.data;
    },
    enabled: !!itemToView?._id && openView,
    retry: false,
  });
  const movements: StockMovement[] = movementsData?.data || [];

  // Filtering
  const filteredItems = items
    .filter((i) => filterCategory === "All" || i.category === filterCategory)
    .filter((i) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        i.name?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.supplier?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    });

  // Stats
  const totalItems = items.length;
  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const lowStockItems = items.filter(
    (i) => i.minQuantity !== undefined && i.minQuantity > 0 && i.quantity <= i.minQuantity
  );

  const usedCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ) as string[];

  const resetForm = () => {
    setFormName(""); setFormCategory(""); setFormDescription("");
    setFormQuantity(""); setFormMinQuantity(""); setFormPrice("");
    setFormSupplier(""); setFormDateBought(""); setEditingItem(null);
  };

  const resetMovementForm = () => {
    setMoveType("restock"); setMoveQuantity(""); setMoveNote("");
    setItemForMovement(null);
  };

  const openAddModal = () => {
    resetForm();
    setOpenAddEdit(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormCategory(item.category || "");
    setFormDescription(item.description || "");
    setFormQuantity(String(item.quantity ?? ""));
    setFormMinQuantity(String(item.minQuantity ?? ""));
    setFormPrice(String(item.price ?? ""));
    setFormSupplier(item.supplier || "");
    setFormDateBought(
      item.dateBought ? new Date(item.dateBought).toISOString().split("T")[0] : ""
    );
    setOpenAddEdit(true);
  };

  const openMovementModal = (item: InventoryItem) => {
    resetMovementForm();
    setItemForMovement(item);
    setOpenMovement(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || formQuantity === "" || formPrice === "") {
      toast.error("Please fill in Name, Quantity, and Price", toastOptions);
      return;
    }

    const payload: any = {
      name: formName.trim(),
      quantity: Number(formQuantity),
      price: Number(formPrice),
    };
    if (formCategory) payload.category = formCategory;
    if (formDescription.trim()) payload.description = formDescription.trim();
    if (formMinQuantity !== "") payload.minQuantity = Number(formMinQuantity);
    if (formSupplier.trim()) payload.supplier = formSupplier.trim();
    if (formDateBought) payload.dateBought = formDateBought;

    setSaving(true);
    try {
      if (editingItem) {
        await SERVER.put(`inventory/${editingItem._id}`, payload);
        toast.success("Item updated successfully!", toastOptions);
      } else {
        await SERVER.post("inventory", payload);
        toast.success("Item added successfully!", toastOptions);
      }
      queryClient.invalidateQueries({ queryKey: ["all-inventory"] });
      resetForm();
      setOpenAddEdit(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to save item",
        toastOptions
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await SERVER.delete(`inventory/${itemToDelete._id}`);
      toast.success("Item deleted successfully!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-inventory"] });
      setOpenDelete(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to delete item",
        toastOptions
      );
    }
  };

  const handleRecordMovement = async () => {
    if (!itemForMovement || !moveQuantity || Number(moveQuantity) < 1) {
      toast.error("Please enter a valid quantity", toastOptions);
      return;
    }
    const moveTypeInfo = MOVEMENT_TYPES.find((m) => m.value === moveType);
    if (!moveTypeInfo?.adds && Number(moveQuantity) > itemForMovement.quantity) {
      toast.error(
        `Cannot ${moveType} more than the current stock (${itemForMovement.quantity})`,
        toastOptions
      );
      return;
    }

    setRecording(true);
    try {
      await SERVER.post(`inventory/${itemForMovement._id}/movements`, {
        type: moveType,
        quantity: Number(moveQuantity),
        note: moveNote.trim() || undefined,
      });
      toast.success("Stock movement recorded!", toastOptions);
      queryClient.invalidateQueries({ queryKey: ["all-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", itemForMovement._id] });
      resetMovementForm();
      setOpenMovement(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to record movement",
        toastOptions
      );
    } finally {
      setRecording(false);
    }
  };

  // Build table rows
  const tableData = filteredItems.map((item, i) => {
    const isLow =
      item.minQuantity !== undefined &&
      item.minQuantity > 0 &&
      item.quantity <= item.minQuantity;
    return {
      sn: i + 1,
      name: (
        <div className="flex flex-col">
          <p className="text-sm font-medium">{item.name}</p>
          {item.category && (
            <p className="text-xs text-gray-500">{item.category}</p>
          )}
        </div>
      ),
      quantity: (
        <span className={isLow ? "text-red-600 font-semibold" : ""}>
          {item.quantity}
          {isLow && <span className="ml-1 text-xs text-red-600">(Low)</span>}
        </span>
      ),
      price: `₦${item.price.toLocaleString()}`,
      totalValue: `₦${(item.price * item.quantity).toLocaleString()}`,
      dateBought: item.dateBought
        ? new Date(item.dateBought).toLocaleDateString()
        : "-",
      supplier: item.supplier || "-",
      actions: "",
      id: item._id,
      _raw: item,
    };
  });

  const headcells = [
    { key: "sn", name: "S/N" },
    { key: "name", name: "Item" },
    { key: "quantity", name: "Quantity" },
    { key: "price", name: "Price/Unit" },
    { key: "totalValue", name: "Total Value" },
    { key: "supplier", name: "Supplier" },
    { key: "dateBought", name: "Date Bought" },
    {
      key: "actions",
      name: [
        {
          name: "Delete item",
          handleClick: (row: any) => {
            setItemToDelete(row._raw);
            setOpenDelete(true);
          },
        },
        {
          name: "Edit item",
          handleClick: (row: any) => openEditModal(row._raw),
        },
        {
          name: "View details",
          handleClick: (row: any) => {
            setItemToView(row._raw);
            setOpenView(true);
          },
        },
        {
          name: "Record stock movement",
          handleClick: (row: any) => openMovementModal(row._raw),
        },
      ],
    },
  ];

  if (isPending) return <Loader />;

  // Selected movement type info (for live preview in modal)
  const selectedMoveType = MOVEMENT_TYPES.find((m) => m.value === moveType);
  const previewNewQuantity = itemForMovement && moveQuantity
    ? (selectedMoveType?.adds
      ? itemForMovement.quantity + Number(moveQuantity)
      : itemForMovement.quantity - Number(moveQuantity))
    : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">Manage all school inventory items</p>
        <Button
          color="tertiary"
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
          sx={{
            color: "white", borderRadius: "10px",
            paddingY: "10px", paddingX: "20px", textTransform: "capitalize",
          }}
        >
          Add Item
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-black">{totalItems}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
          <p className="text-xs text-gray-500 mb-1">Total Inventory Value</p>
          <p className="text-2xl font-bold text-blue-700">
            ₦{totalValue.toLocaleString()}
          </p>
        </div>
        <div
          className={`border rounded-xl p-4 ${
            lowStockItems.length > 0 ? "bg-red-50 border-red-200" : "border-gray-200"
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">Low Stock Items</p>
          <p
            className={`text-2xl font-bold ${
              lowStockItems.length > 0 ? "text-red-700" : "text-gray-700"
            }`}
          >
            {lowStockItems.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-[400px]">
            <Search fontSize="small" className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="flex-1 outline-none text-sm"
            />
          </div>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {usedCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {/* Table or Empty state */}
      {items.length === 0 ? (
        <EmptyTable
          message="No items in inventory yet"
          text="Add Item"
          onClick={openAddModal}
        />
      ) : filteredItems.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] border border-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-500">No items match your search or filter</p>
            <Button
              variant="outlined"
              color="tertiary"
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("All");
              }}
              sx={{
                borderRadius: "10px",
                textTransform: "capitalize",
                paddingY: "8px",
                paddingX: "20px",
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <TableComponent
          headcells={headcells}
          tableData={tableData}
          message="No items match your filters"
        />
      )}

      {/* ==================== ADD / EDIT MODAL ==================== */}
      <Modal
        openModal={openAddEdit}
        closeModal={() => { setOpenAddEdit(false); resetForm(); }}
        title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
        maxWidth="600px"
      >
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Item Name *</label>
            <input
              type="text" value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Whiteboard Markers"
              className="border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formCategory} label="Category"
              onChange={(e) => setFormCategory(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="">— None —</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">
                {editingItem ? "Current Quantity *" : "Starting Quantity *"}
              </label>
              <input
                type="number" min="0" value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                placeholder="e.g. 50"
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
              {editingItem && (
                <p className="text-xs text-gray-400 mt-1">
                  Tip: use "Record stock movement" for normal stock changes
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Price per Unit (₦) *</label>
              <input
                type="number" min="0" step="0.01" value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 500"
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Min Stock Level</label>
              <input
                type="number" min="0" value={formMinQuantity}
                onChange={(e) => setFormMinQuantity(e.target.value)}
                placeholder="Alert threshold"
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Date Bought</label>
              <input
                type="date" value={formDateBought}
                onChange={(e) => setFormDateBought(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Supplier</label>
            <input
              type="text" value={formSupplier}
              onChange={(e) => setFormSupplier(e.target.value)}
              placeholder="e.g. Basitech Stationery Ltd"
              className="border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Description / Notes</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional notes about the item" rows={3}
              className="border border-gray-300 rounded-lg p-2.5 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button" variant="outlined"
              onClick={() => { setOpenAddEdit(false); resetForm(); }}
              sx={{ borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}
            >
              Cancel
            </Button>
            <Button
              type="button" color="tertiary" variant="contained"
              onClick={handleSave} disabled={saving}
              sx={{
                color: "white", borderRadius: "10px",
                paddingY: "10px", textTransform: "capitalize",
              }}
            >
              {saving ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================== STOCK MOVEMENT MODAL ==================== */}
      <Modal
        openModal={openMovement}
        closeModal={() => { setOpenMovement(false); resetMovementForm(); }}
        title="Record Stock Movement"
        maxWidth="500px"
      >
        {itemForMovement && (
          <div className="flex flex-col gap-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">Item</p>
              <p className="font-semibold text-black">{itemForMovement.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current stock: <span className="font-bold">{itemForMovement.quantity}</span>
              </p>
            </div>

            <FormControl size="small" fullWidth>
              <InputLabel>Movement Type *</InputLabel>
              <Select
                value={moveType} label="Movement Type *"
                onChange={(e) => setMoveType(e.target.value)}
                sx={{ borderRadius: "10px" }}
              >
                {MOVEMENT_TYPES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      {m.adds ? (
                        <TrendingUp fontSize="small" className="text-green-600" />
                      ) : (
                        <TrendingDown fontSize="small" className="text-red-600" />
                      )}
                      {m.label}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Quantity *</label>
              <input
                type="number" min="1" value={moveQuantity}
                onChange={(e) => setMoveQuantity(e.target.value)}
                placeholder="How many units?"
                className="border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>

            {previewNewQuantity !== null && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  previewNewQuantity < 0
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {previewNewQuantity < 0
                  ? `⚠ Cannot ${moveType}: would result in negative stock (${previewNewQuantity})`
                  : <>New quantity after this {selectedMoveType?.label.toLowerCase()}: <span className="font-bold">{previewNewQuantity}</span></>}
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Note (optional)</label>
              <textarea
                value={moveNote} onChange={(e) => setMoveNote(e.target.value)}
                placeholder="e.g. Distributed to classrooms, damaged in storage"
                rows={2}
                className="border border-gray-300 rounded-lg p-2.5 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button" variant="outlined"
                onClick={() => { setOpenMovement(false); resetMovementForm(); }}
                sx={{ borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}
              >
                Cancel
              </Button>
              <Button
                type="button" color="tertiary" variant="contained"
                onClick={handleRecordMovement}
                disabled={recording || (previewNewQuantity !== null && previewNewQuantity < 0)}
                sx={{
                  color: "white", borderRadius: "10px",
                  paddingY: "10px", textTransform: "capitalize",
                }}
              >
                {recording ? "Recording..." : "Record Movement"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== VIEW MODAL with HISTORY ==================== */}
      <Modal
        openModal={openView}
        closeModal={() => { setOpenView(false); setItemToView(null); }}
        title={itemToView?.name || "Item Details"}
        maxWidth="700px"
      >
        {itemToView && (
          <div className="flex flex-col gap-y-4">
            <div className="flex gap-2 flex-wrap">
              {itemToView.category && (
                <Chip label={itemToView.category} size="small" variant="outlined" />
              )}
              {itemToView.minQuantity !== undefined &&
                itemToView.minQuantity > 0 &&
                itemToView.quantity <= itemToView.minQuantity && (
                  <Chip
                    label="Low Stock" size="small"
                    sx={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                  />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-lg font-semibold">{itemToView.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price per Unit</p>
                <p className="text-lg font-semibold">
                  ₦{itemToView.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="text-lg font-semibold text-[#0E7094]">
                  ₦{(itemToView.price * itemToView.quantity).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Min Stock Level</p>
                <p className="text-lg font-semibold">
                  {itemToView.minQuantity ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Supplier</span>
                <span className="text-sm font-medium">{itemToView.supplier || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date Bought</span>
                <span className="text-sm font-medium">
                  {itemToView.dateBought
                    ? new Date(itemToView.dateBought).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Added on</span>
                <span className="text-sm font-medium">
                  {itemToView.createdAt
                    ? new Date(itemToView.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            {itemToView.description && (
              <div className="flex flex-col">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3">
                  {itemToView.description}
                </p>
              </div>
            )}

            {/* Stock Movement History */}
            <div className="flex items-center justify-between mt-2">
              <h3 className="font-semibold text-black">
                Stock Movement History ({movements.length})
              </h3>
              <Button
                type="button" variant="outlined" color="tertiary" size="small"
                onClick={() => { setOpenView(false); openMovementModal(itemToView); }}
                sx={{ borderRadius: "8px", textTransform: "capitalize" }}
              >
                Record Movement
              </Button>
            </div>

            {movements.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">
                No stock movements recorded yet
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 sticky top-0">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Before</th>
                      <th className="p-2 text-right">After</th>
                      <th className="p-2 text-left">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => {
                      const mType = MOVEMENT_TYPES.find((t) => t.value === m.type);
                      return (
                        <tr key={m._id} className="border-t border-gray-100">
                          <td className="p-2">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${movementBadgeColor(m.type)}`}
                            >
                              {mType?.label || m.type}
                            </span>
                          </td>
                          <td className="p-2 text-right font-medium">
                            {mType?.adds ? "+" : "-"}{m.quantity}
                          </td>
                          <td className="p-2 text-right text-gray-500">
                            {m.quantityBefore}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {m.quantityAfter}
                          </td>
                          <td className="p-2 text-gray-500">
                            {m.recordedByName || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <Button
                type="button" variant="outlined"
                onClick={() => { setOpenView(false); openEditModal(itemToView); }}
                sx={{ borderRadius: "10px", paddingY: "10px", textTransform: "capitalize" }}
              >
                Edit Item
              </Button>
              <Button
                type="button" color="tertiary" variant="contained"
                onClick={() => setOpenView(false)}
                sx={{
                  color: "white", borderRadius: "10px",
                  paddingY: "10px", textTransform: "capitalize",
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== DELETE CONFIRMATION ==================== */}
      <MessageModal
        column
        desc={`Are you sure you want to delete "${itemToDelete?.name}"? This will hide it from the active inventory.`}
        openModal={openDelete}
        closeModal={() => { setOpenDelete(false); setItemToDelete(null); }}
        handleClick={handleDelete}
        btn1Name="Yes, delete"
        btn2Name="Cancel"
      />
    </div>
  );
}