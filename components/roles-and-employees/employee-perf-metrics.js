/** Shared perf-card metric calculations (matches design.html perfStats). */

export function findKpiCard(item, key) {
  return item?.cards?.find((c) => c.key === key);
}

export function computeEmployeePerfMetrics(item, maxCompleted) {
  const received = findKpiCard(item, "received")?.value ?? 0;
  const openNow = findKpiCard(item, "open_now")?.value ?? 0;
  const completed = findKpiCard(item, "completed")?.value ?? 0;
  const late = findKpiCard(item, "late_over_24h")?.value ?? 0;

  const slaTotal = item.receive_sla?.total;
  const slaWithin = item.receive_sla?.within;
  const pickSamples = slaTotal ?? received;

  let pickPct;
  if (slaWithin != null && slaTotal != null && slaTotal > 0) {
    pickPct = Math.round((slaWithin / slaTotal) * 100);
  } else if (item.receive_sla?.percent != null && pickSamples > 0) {
    pickPct = Math.round(item.receive_sla.percent);
  } else if (pickSamples > 0) {
    pickPct = 0;
  } else {
    pickPct = 100;
  }

  let procPct;
  if (item.process_sla?.percent != null) {
    procPct = Math.round(item.process_sla.percent);
  } else if (openNow > 0) {
    procPct = Math.max(0, Math.min(100, Math.round((1 - late / openNow) * 100)));
  } else {
    procPct = 100;
  }

  const maxDone = Math.max(1, maxCompleted ?? 0);
  const volPct = Math.round((completed / maxDone) * 100);

  const score =
    item.score ??
    item.performance_score ??
    Math.round(pickPct * 0.4 + procPct * 0.4 + volPct * 0.2);

  const avgPick = item.avg_receive?.value;
  const pickLabel =
    avgPick != null
      ? `سرعة الاستلام داخل الدوام — متوسط ${avgPick} د`
      : "سرعة الاستلام داخل الدوام";

  return {
    received,
    openNow,
    completed,
    late,
    pickPct,
    procPct,
    volPct,
    score,
    pickLabel,
  };
}
