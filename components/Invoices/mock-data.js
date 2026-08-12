export const INVOICE_STATUSES = [
  { id: "all", label: "كل الحالات" },
  { id: "paid", label: "مدفوعة" },
  { id: "refunded", label: "مسترجعة" },
];

export const INVOICE_TYPES = [
  { id: "all", label: "كل الأنواع" },
  { id: "residential", label: "سكني" },
  { id: "commercial", label: "تجاري" },
];

export const CONTRACT_TYPE = {
  residential: {
    id: "residential",
    label: "سكني",
    className:
      "bg-[#E6F4EA] text-[#1E7E34] dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  commercial: {
    id: "commercial",
    label: "تجاري",
    className:
      "bg-[#F3E5F5] text-[#6A1B9A] dark:bg-purple-500/20 dark:text-purple-300",
  },
};

export const INVOICE_STATUS = {
  paid: {
    id: "paid",
    label: "مدفوعة",
    className:
      "bg-[#E6F4EA] text-[#1E7E34] dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  refunded: {
    id: "refunded",
    label: "مسترجعة",
    className:
      "bg-[#FDECEA] text-[#C62828] dark:bg-rose-500/20 dark:text-rose-300",
  },
};

const SOURCES = ["دفع مباشر", "رابط دفع", "بوابة الدفع"];

const CUSTOMER_NAMES = [
  "سعد محمد الغنام",
  "نورة القحطاني",
  "خالد العتيبي",
  "test",
  "فاطمة الشمري",
  "عبدالله الدوسري",
  "منى الحربي",
  "يوسف المطيري",
];

const MOBILES = [
  "0500000030",
  "0551234567",
  "0539876543",
  "0554567814",
  "0567788990",
  "0504455667",
  "0583344556",
  "0516677889",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDate(offsetDays) {
  const d = new Date(2026, 2, 12);
  d.setDate(d.getDate() - offsetDays);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Amounts chosen so paid invoices sum to 16,342 as in the design. */
const PAID_AMOUNTS = [
  ...Array(45).fill(249),
  ...Array(12).fill(399),
  349,
];

const REFUNDED_AMOUNTS = [249, 399, 249];

function buildInvoice({ index, orderNo, amount, status, type }) {
  return {
    id: `inv-${orderNo}`,
    invoiceNo: `INV-${orderNo}`,
    orderNo: String(orderNo),
    customerName: CUSTOMER_NAMES[index % CUSTOMER_NAMES.length],
    mobile: MOBILES[index % MOBILES.length],
    contractType: type,
    amount,
    source: SOURCES[index % SOURCES.length],
    status,
    date: formatDate(index),
    referenceNo: `AQD-${orderNo}-${1000 + ((index * 37) % 9000)}`,
  };
}

function buildInvoices() {
  const rows = [];
  let orderNo = 990030;

  PAID_AMOUNTS.forEach((amount, i) => {
    rows.push(
      buildInvoice({
        index: i,
        orderNo,
        amount,
        status: "paid",
        type: i % 5 === 2 ? "commercial" : "residential",
      })
    );
    orderNo -= 1;
  });

  REFUNDED_AMOUNTS.forEach((amount, i) => {
    rows.push(
      buildInvoice({
        index: PAID_AMOUNTS.length + i,
        orderNo,
        amount,
        status: "refunded",
        type: i === 1 ? "commercial" : "residential",
      })
    );
    orderNo -= 1;
  });

  return rows;
}

export const MOCK_INVOICES = buildInvoices();

export function getInvoiceStats(rows = MOCK_INVOICES) {
  const paid = rows.filter((row) => row.status === "paid");
  const refunded = rows.filter((row) => row.status === "refunded");
  const collected = paid.reduce((sum, row) => sum + row.amount, 0);

  return {
    paid: paid.length,
    refunded: refunded.length,
    total: rows.length,
    collected,
  };
}
