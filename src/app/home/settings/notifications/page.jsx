import SendNotificationPage from "@/components/analysis/settings/notifications/send-notification-page";

export default async function NotificationsSettingsPage({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <SendNotificationPage />;
}
