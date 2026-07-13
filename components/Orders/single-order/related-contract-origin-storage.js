const STORAGE_KEY = "aqdi-related-contract-origin";

export function readRelatedContractSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.originId) return null;
    return {
      originId: String(parsed.originId),
      groupIds: Array.isArray(parsed.groupIds)
        ? parsed.groupIds.map(String)
        : [],
    };
  } catch {
    return null;
  }
}

export function writeRelatedContractSession({ originId, groupIds }) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      originId: String(originId),
      groupIds: groupIds.map(String),
    })
  );
}

export function clearRelatedContractOrigin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function syncRelatedContractOrigin(orderData) {
  const contracts = Array.isArray(orderData?.user_contracts)
    ? orderData.user_contracts
    : [];
  const currentContractId =
    orderData?.id ?? orderData?.contract_summary?.id ?? null;

  if (!currentContractId || !contracts.length) return null;

  const currentId = String(currentContractId);
  const groupIds = contracts
    .map((contract) => contract?.id)
    .filter((id) => id != null)
    .map(String);

  const session = readRelatedContractSession();

  if (session?.originId && session.groupIds.includes(currentId)) {
    return session.originId;
  }

  writeRelatedContractSession({ originId: currentId, groupIds });
  return currentId;
}

export function getRelatedContractOriginId() {
  return readRelatedContractSession()?.originId ?? null;
}
