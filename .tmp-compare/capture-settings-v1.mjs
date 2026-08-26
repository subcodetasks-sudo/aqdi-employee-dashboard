import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "C:/subcode/aqdi-employee-dashboard/.tmp-compare";
fs.mkdirSync(OUT, { recursive: true });

const fakeUser = {
  id: 1,
  name: "Compare Admin",
  email: "compare@aqdi.local",
  is_super_admin: true,
  role: { name: "admin" },
  permissions: ["*"],
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    locale: "ar-SA",
  });
  await ctx.addCookies([
    {
      name: "token",
      value: "visual-compare-token",
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
  ]);

  const page = await ctx.newPage();
  const expiresAt = Date.now() + 60 * 60 * 1000;

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("refresh-token") || url.includes("/refresh")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            access_token: "visual-compare-token",
            refresh_token: "visual-compare-refresh",
            token: "visual-compare-token",
          },
        }),
      });
    }

    if (url.includes("/admin/unit-types") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { id: 1, name_ar: "شقة", contract_type: "residential" },
            { id: 2, name_ar: "فيلا", contract_type: "residential" },
            { id: 3, name_ar: "مكتب", contract_type: "commercial" },
          ],
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: method === "GET" ? [] : {} }),
    });
  });

  await page.addInitScript(
    ({ user, expiresAt }) => {
      localStorage.setItem("aqdi_remember_me", "true");
      localStorage.setItem("aqdi_access_token", "visual-compare-token");
      localStorage.setItem("aqdi_refresh_token", "visual-compare-refresh");
      localStorage.setItem("aqdi_token_expires_at", String(expiresAt));
      localStorage.setItem("aqdi_auth_user", JSON.stringify(user));
    },
    { user: fakeUser, expiresAt }
  );

  const report = { url: null, grid: null, detail: null, modal: null };

  await page.goto("http://localhost:3000/home/settings", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".set-catgrid", { timeout: 20000 });
  await page.waitForTimeout(1200);
  report.url = page.url();

  await page.locator(".set-catgrid").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, "settings-grid-v1.png"),
    fullPage: false,
  });

  report.grid = await page.evaluate(() => {
    const keys = [
      "border-top-color",
      "border-color",
      "border-radius",
      "padding",
      "gap",
      "box-shadow",
      "background-color",
      "font-size",
      "font-weight",
      "color",
      "width",
      "height",
      "display",
      "align-items",
    ];
    const measure = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const o = {
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 100),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
      for (const k of keys) o[k] = cs.getPropertyValue(k);
      return o;
    };
    let hoverBorder = null;
    for (const s of document.styleSheets) {
      try {
        for (const rule of s.cssRules || []) {
          if (rule.selectorText?.includes(".set-catcard:hover")) {
            hoverBorder =
              rule.style.getPropertyValue("border-color") || rule.style.borderColor;
          }
        }
      } catch {}
    }
    const card = document.querySelector(".set-catcard");
    return {
      cardCount: document.querySelectorAll(".set-catcard").length,
      card: measure(card),
      icon: measure(document.querySelector(".set-caticon")),
      title: measure(document.querySelector(".set-cattext b")),
      sub: measure(document.querySelector(".set-cattext small")),
      arrow: measure(document.querySelector(".set-catarrow")),
      hoverBorder,
      hasArrowChar: (document.querySelector(".set-catarrow")?.textContent || "").includes(
        "←"
      ),
    };
  });

  await page.locator(".set-catcard", { hasText: "أنواع الوحدات" }).first().click();
  await page.waitForURL("**/home/settings/unit-types**", { timeout: 20000 });
  await page.waitForSelector(".mkt-tbl, .radm-head", { timeout: 15000 });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(OUT, "settings-unit-types-v1.png"),
    fullPage: false,
  });

  report.detail = await page.evaluate(() => {
    const keys = [
      "background-color",
      "border-radius",
      "padding",
      "font-size",
      "font-weight",
      "color",
      "gap",
      "display",
    ];
    const measure = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const o = {
        className: (el.className?.toString?.() || "").slice(0, 80),
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 80),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
      for (const k of keys) o[k] = cs.getPropertyValue(k);
      return o;
    };
    return {
      hasRadmHead: !!document.querySelector(".radm-head"),
      backClass: document.querySelector(".radm-head button")?.className || null,
      back: measure(document.querySelector(".mkt-back, .backb")),
      title: measure(document.querySelector(".radm-ttl b")),
      subtitle: measure(document.querySelector(".radm-ttl small")),
      addBtn: measure(document.querySelector(".xbtn")),
      tableHeader: measure(document.querySelector(".mkt-tbl thead th")),
      hasMktTbl: !!document.querySelector(".mkt-tbl"),
      hasTblwrap: !!document.querySelector(".tblwrap"),
      rowCount: document.querySelectorAll(".mkt-tbl tbody tr").length,
    };
  });

  await page.locator(".xbtn").filter({ hasText: "إضافة" }).first().click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(OUT, "settings-unit-types-modal-v1.png"),
    fullPage: false,
  });

  report.modal = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return null;
    const cs = getComputedStyle(dlg);
    const r = dlg.getBoundingClientRect();
    const buttons = [...dlg.querySelectorAll("button")].map((b) =>
      (b.innerText || b.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()
    );
    const titleEl = dlg.querySelector("h2");
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      maxWidth: cs.maxWidth,
      borderRadius: cs.borderRadius,
      padding: cs.padding,
      title: (titleEl?.innerText || "").trim(),
      buttons,
      hasSave: buttons.some((t) => t.includes("حفظ")),
      hasCancel: buttons.some((t) => t.includes("إلغاء")),
      hasHeaderBorder: !!dlg.querySelector(".border-b, [class*='border-b']"),
      hasFooterBorder: !!dlg.querySelector(".border-t, [class*='border-t']"),
      fieldCount: dlg.querySelectorAll("input, button[role='combobox']").length,
    };
  });

  // Compare vs design expectations
  const mismatches = [];
  const g = report.grid;
  if (!g?.icon || !g?.title || !g?.sub || !g?.hasArrowChar) {
    mismatches.push("Category cards missing icon/title/subtitle/← arrow structure");
  }
  if (g?.hoverBorder && !/#bfe0d3/i.test(g.hoverBorder) && g.hoverBorder !== "rgb(191, 224, 211)") {
    // only flag if hover rule missing soft green
    if (!String(g.hoverBorder).includes("191") && !String(g.hoverBorder).toLowerCase().includes("bfe0d3")) {
      mismatches.push(`Category card hover border not soft green (#bfe0d3): ${g.hoverBorder}`);
    }
  }
  const d = report.detail;
  if (!d?.hasRadmHead) mismatches.push("Detail missing .radm-head");
  const titleFs = parseFloat(d?.title?.["font-size"] || "0");
  if (Math.abs(titleFs - 17) > 0.5) {
    mismatches.push(`Detail title font-size ${titleFs}px (expected 17px)`);
  }
  if (!d?.back) mismatches.push("Detail missing back chip (.mkt-back/.backb)");
  if (!d?.addBtn || !String(d.addBtn.text).includes("إضافة")) {
    mismatches.push("Detail missing green + إضافة (.xbtn)");
  } else {
    const bg = d.addBtn["background-color"] || "";
    if (!bg.includes("14, 95, 78") && !bg.includes("#0e5f4e")) {
      // rgb(14, 95, 78) = #0e5f4e
      mismatches.push(`Add button bg not brand green #0e5f4e: ${bg}`);
    }
  }
  if (!d?.hasMktTbl) mismatches.push("Detail missing .mkt-tbl");
  else {
    const thBg = d.tableHeader?.["background-color"] || "";
    if (!thBg.includes("238, 245, 241") && !thBg.toLowerCase().includes("eef5f1")) {
      mismatches.push(`Table header bg not soft green #eef5f1: ${thBg}`);
    }
  }
  const m = report.modal;
  if (!m) mismatches.push("Modal did not open");
  else {
    if (m.w < 420 || m.w > 540) {
      mismatches.push(`Modal width ${m.w}px (design ~480px / max-w-md≈448)`);
    }
    if (!m.hasSave || !m.hasCancel) {
      mismatches.push(`Modal missing حفظ/إلغاء (buttons: ${m.buttons.join(", ")})`);
    }
    if (!m.hasHeaderBorder || !m.hasFooterBorder) {
      mismatches.push("Modal missing header/body/footer bordered sections");
    }
  }

  report.mismatches = mismatches;

  fs.writeFileSync(path.join(OUT, "settings-v1-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
