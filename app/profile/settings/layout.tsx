"use client"

import { useUser } from "@thirdweb-dev/react";
import { SidebarNav } from "@/components/ui/sidebar-nav"
import { PROFILE_SETTINGS_INTEGRATION_URL, PROFILE_SETTINGS_NOTIFICATION_URL, PROFILE_SETTINGS_PRIVACY_URL, PROFILE_SETTINGS_URL } from "@/const/links"
import { ConnectBtn } from "@/components/thirdweb/connect-btn";

const sidebarNavItems = [
  {
    title: "Profile",
    href: PROFILE_SETTINGS_URL,
  },
  {
    title: "Integration",
    href: PROFILE_SETTINGS_INTEGRATION_URL,
  },
  {
    title: "Privacy",
    href: PROFILE_SETTINGS_PRIVACY_URL,
  },
  {
    title: "Notification",
    href: PROFILE_SETTINGS_NOTIFICATION_URL,
  },
]

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoggedIn, isLoading } = useUser()

  if (!isLoading && !isLoggedIn) {
    return (
      <div className="space-y-6 md:px-10 py-10 pb-16">
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Oops! Login or sign up first to setup your profile</h3>
          <ConnectBtn />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:px-10 py-10 pb-16">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}