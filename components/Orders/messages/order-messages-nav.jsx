"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useOrderMessageAlerts } from "@/src/hooks/use-order-message-alerts";
import OrderMessageDialog from "./order-message-dialog";
import OrderPricesPanel from "./order-prices-panel";
import {
  getAlertDisplayName,
  groupAlertsByContractType,
  isMessageOnline,
} from "./order-message-utils";

const pillClass =
  "relative z-40 flex items-center gap-3 bg-black rounded-full px-5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.2)] pointer-events-auto";

const panelClass =
  "w-auto max-w-none rounded-[28px] border border-[#EBEBEB] bg-white p-3 shadow-[0_16px_48px_rgba(0,0,0,0.15)]";

const columnsWrapClass = "flex flex-row items-start gap-3";

const columnClass =
  "bg-[#F3F3F3] rounded-20 p-2 min-w-[min(280px,calc(50vw-32px))] max-w-[min(320px,calc(50vw-24px))] max-h-[min(70vh,480px)] overflow-y-auto";

const rowClass =
  "flex items-center gap-2.5 w-full rounded-14 px-2.5 py-3 text-right transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main/30";

function getRowIconClass(name = "") {
  const text = String(name);
  if (text.includes("وقف")) return "fa-landmark";
  if (text.includes("ورقي") || text.includes("ورث")) return "fa-file-lines";
  if (text.includes("تجار") || text.toLowerCase().includes("commercial")) {
    return "fa-building";
  }
  return "fa-house";
}

function MessageRowIcon({ name }) {
  return (
    <span className="w-8 h-8 rounded-[10px] bg-white border border-[#E8E8E8] flex items-center justify-center shrink-0 text-[#333]">
      <i className={`fa-solid ${getRowIconClass(name)} text-13`} aria-hidden />
    </span>
  );
}

function OnlineDot({ show }) {
  if (!show) return <span className="w-2.5 shrink-0" aria-hidden />;
  return (
    <span
      className="w-2.5 h-2.5 rounded-full bg-brand-accent shrink-0 ring-2 ring-[#F3F3F3]"
      title="متصل"
      aria-label="متصل"
    />
  );
}

function SectionRow({ name, showOnline, onClick }) {
  return (
    <button type="button" className={rowClass} onClick={onClick}>
      <MessageRowIcon name={name} />
      <span className="flex-1 text-13 font-semibold text-[#1A1A1A] leading-snug">
        {name}
      </span>
      <OnlineDot show={showOnline} />
      <ChevronLeft className="size-3.5 shrink-0 text-[#C4C4C4]" strokeWidth={2} />
    </button>
  );
}

function ContractTypeColumn({ column, onSelect }) {
  return (
    <div className={columnClass}>
      <p className="text-13 font-bold text-[#1A1A1A] px-2.5 py-2 mb-1">{column.name}</p>
      {!column.items.length ? (
        <p className="text-xs text-ink-placeholder text-center py-6">لا توجد رسائل</p>
      ) : (
        column.items.map((alert) => (
          <SectionRow
            key={alert.id}
            name={getAlertDisplayName(alert)}
            showOnline={isMessageOnline(alert)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(alert);
            }}
          />
        ))
      )}
    </div>
  );
}

function MessagesSectionsPanel({ alerts, isLoading, onSelect }) {
  const columns = groupAlertsByContractType(alerts);

  if (isLoading) {
    return (
      <div className={`${columnClass} flex items-center justify-center py-12`}>
        <Loader2 className="size-6 animate-spin text-ink-placeholder" />
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className={columnClass}>
        <p className="text-13 text-ink-placeholder text-center py-8">لا توجد رسائل</p>
      </div>
    );
  }

  return (
    <div className={columnsWrapClass}>
      {columns.map((column) => (
        <ContractTypeColumn key={column.id} column={column} onSelect={onSelect} />
      ))}
    </div>
  );
}

function PillTriggerButton({ isOpen, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-13 font-semibold transition-colors outline-none ${
        isOpen ? "text-brand-main" : "text-white"
      }`}
    >
      {children}
      <i
        className={`fa-solid text-10 ${
          isOpen ? "fa-chevron-up" : "fa-chevron-down"
        } ${isOpen ? "text-brand-main" : "text-white"}`}
        aria-hidden
      />
    </button>
  );
}

function DotSeparator() {
  return <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" aria-hidden />;
}

function DropdownMenuShell({
  menuId,
  label,
  isOpen,
  onToggle,
  onClose,
  children,
}) {
  const rootRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + 12,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      const panel = document.getElementById(`order-messages-panel-${menuId}`);
      if (panel?.contains(event.target)) return;
      onClose();
    };

    const onScrollOrResize = () => updatePosition();

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [isOpen, menuId, onClose, updatePosition]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) updatePosition();
    onToggle();
  };

  const panel =
    isOpen && mounted
      ? createPortal(
          <div
            id={`order-messages-panel-${menuId}`}
            role="menu"
            dir="rtl"
            className={`fixed z-[9999] -translate-x-1/2 ${panelClass}`}
            style={{ top: panelPos.top, left: panelPos.left }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <PillTriggerButton isOpen={isOpen} onClick={handleToggle}>
        {label}
      </PillTriggerButton>
      {panel}
    </div>
  );
}

function MessagesMenu({
  menuId,
  label,
  alerts,
  isLoading,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}) {
  return (
    <DropdownMenuShell
      menuId={menuId}
      label={label}
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
    >
      <MessagesSectionsPanel alerts={alerts} isLoading={isLoading} onSelect={onSelect} />
    </DropdownMenuShell>
  );
}

function PricesMenu({ isOpen, onToggle, onClose }) {
  return (
    <DropdownMenuShell
      menuId="prices"
      label="الأسعار"
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
    >
      <OrderPricesPanel enabled={isOpen} />
    </DropdownMenuShell>
  );
}

export default function OrderMessagesNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { employeeAlerts, clientAlerts, isLoading } = useOrderMessageAlerts(true);

  const handleSelect = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
    setActiveMenu(null);
  };

  const toggleMenu = (menu) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  return (
    <>
      <nav className={pillClass} dir="rtl" aria-label="رسائل توضيحية">
        <MessagesMenu
          menuId="employee"
          label="طلبات عقد"
          alerts={employeeAlerts}
          isLoading={isLoading}
          isOpen={activeMenu === "employee"}
          onToggle={() => toggleMenu("employee")}
          onClose={() => setActiveMenu(null)}
          onSelect={handleSelect}
        />
        <DotSeparator />
        <PricesMenu
          isOpen={activeMenu === "prices"}
          onToggle={() => toggleMenu("prices")}
          onClose={() => setActiveMenu(null)}
        />
        <DotSeparator />
        <MessagesMenu
          menuId="client"
          label="تعليمات للعملاء"
          alerts={clientAlerts}
          isLoading={isLoading}
          isOpen={activeMenu === "client"}
          onToggle={() => toggleMenu("client")}
          onClose={() => setActiveMenu(null)}
          onSelect={handleSelect}
        />
      </nav>

      <OrderMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        messageAlert={selectedAlert}
      />
    </>
  );
}
