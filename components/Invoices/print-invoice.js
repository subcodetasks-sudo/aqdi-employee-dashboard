const TYPE_LABEL = {
  residential: "سكني",
  commercial: "تجاري",
};

const STATUS_LABEL = {
  paid: "مدفوعة",
  refunded: "مسترجعة",
};

export function getInvoiceItemDescription(contractType) {
  return contractType === "commercial"
    ? "رسوم توثيق عقد تجاري – صك إلكتروني – وزارة العدل"
    : "رسوم توثيق عقد سكني – صك إلكتروني – وزارة العدل";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoicePrintHtml(invoice, customerName) {
  if (!invoice) return "";

  const name = (customerName || invoice.customerName || "").trim();
  const customerLine = name
    ? `${name} (${invoice.mobile})`
    : invoice.mobile;
  const typeLabel = TYPE_LABEL[invoice.contractType] || "سكني";
  const statusLabel = STATUS_LABEL[invoice.status] || "مدفوعة";
  const isPaid = invoice.status !== "refunded";
  const amount = Number(invoice.amount).toLocaleString("en-US");
  const description = getInvoiceItemDescription(invoice.contractType);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ${escapeHtml(invoice.invoiceNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Tahoma, Arial, sans-serif;
      margin: 0;
      padding: 32px;
      color: #111827;
      background: #fff;
    }
    .sheet {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 28px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand { color: #0B5345; }
    .brand h1 { margin: 0; font-size: 28px; }
    .brand p { margin: 4px 0 0; font-size: 13px; color: #6B7280; font-weight: 600; }
    .meta { text-align: left; font-size: 13px; color: #4B5563; line-height: 1.8; }
    .rule { height: 2px; background: #0B5345; margin: 18px 0; border: 0; }
    .boxes { display: flex; gap: 10px; }
    .box {
      flex: 1;
      background: #F3F4F6;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .box .label { font-size: 12px; color: #6B7280; margin: 0 0 6px; }
    .box .value { font-size: 14px; font-weight: 700; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    th {
      background: #F3F4F6;
      text-align: right;
      font-size: 13px;
      padding: 10px 12px;
    }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
    .total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #E8F5F1;
      color: #0B5345;
      font-weight: 800;
      padding: 12px 14px;
      border-radius: 8px;
      margin-top: 4px;
    }
    .status {
      display: inline-block;
      margin: 22px auto 0;
      padding: 6px 18px;
      border: 1.5px solid ${isPaid ? "#16A34A" : "#DC2626"};
      color: ${isPaid ? "#15803D" : "#DC2626"};
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
    }
    .status-wrap { text-align: center; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        <h1>عقدي</h1>
        <p>منصة توثيق عقود الإيجار</p>
      </div>
      <div class="meta">
        <div>رقم الفاتورة ${escapeHtml(invoice.invoiceNo)}</div>
        <div>التاريخ ${escapeHtml(invoice.date)}</div>
        <div>الرقم المرجعي ${escapeHtml(invoice.referenceNo)}</div>
      </div>
    </div>
    <hr class="rule" />
    <div class="boxes">
      <div class="box">
        <p class="label">العميل</p>
        <p class="value">${escapeHtml(customerLine)}</p>
      </div>
      <div class="box">
        <p class="label">رقم الطلب</p>
        <p class="value">#${escapeHtml(invoice.orderNo)}</p>
      </div>
      <div class="box">
        <p class="label">نوع العقد</p>
        <p class="value">${escapeHtml(typeLabel)}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:56px">#</th>
          <th>الوصف</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${escapeHtml(description)}</td>
        </tr>
      </tbody>
    </table>
    <div class="total">
      <span>الإجمالي المستحق</span>
      <span>${amount} ريال</span>
    </div>
    <div class="status-wrap">
      <span class="status">${escapeHtml(statusLabel)}${isPaid ? " ✓" : ""}</span>
    </div>
  </div>
</body>
</html>`;
}

export function printInvoice(invoice, customerName) {
  const html = buildInvoicePrintHtml(invoice, customerName);
  if (!html) return false;

  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
  );
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!doc || !win) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } finally {
      setTimeout(() => iframe.remove(), 1000);
    }
  };

  if (doc.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 300);
  }

  return true;
}
