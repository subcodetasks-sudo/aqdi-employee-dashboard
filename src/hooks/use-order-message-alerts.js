"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { normalizeMessageAlerts } from "@/components/orders/messages/order-message-utils";
import { getMessagesByType, parseCustomerMessagesAll } from "@/src/lib/customer-messages";

async function fetchCustomerMessagesForOrders() {
  const res = await axiosInstance.get("/admin/customer-messages/all");
  return parseCustomerMessagesAll(res.data);
}

export function useOrderMessageAlerts(enabled = true) {
  const employeeQuery = useQuery({
    queryKey: ["message-alerts-employee", "orders-nav"],
    queryFn: () =>
      axiosInstance.get("/admin/message-alerts/employee").then((res) => res.data),
    enabled,
    staleTime: 60_000,
  });

  const customerMessagesQuery = useQuery({
    queryKey: ["customer-messages", "all", "orders-nav"],
    queryFn: fetchCustomerMessagesForOrders,
    enabled,
    staleTime: 60_000,
  });

  const customerMessages = customerMessagesQuery.data?.messages ?? [];
  const clientPayload = { data: { items: getMessagesByType(customerMessages, "client") } };
  const propertyPayload = { data: { items: getMessagesByType(customerMessages, "property") } };

  const employeeAlerts = normalizeMessageAlerts(employeeQuery.data);
  const clientAlerts = normalizeMessageAlerts(clientPayload);
  const propertyAlerts = normalizeMessageAlerts(propertyPayload);

  return {
    employeeAlerts,
    clientAlerts,
    propertyAlerts,
    isLoading: employeeQuery.isLoading || customerMessagesQuery.isLoading,
    hasAlerts:
      employeeAlerts.length > 0 ||
      clientAlerts.length > 0 ||
      propertyAlerts.length > 0,
  };
}
