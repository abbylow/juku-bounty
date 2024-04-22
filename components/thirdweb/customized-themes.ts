import { darkTheme, lightTheme } from '@thirdweb-dev/react'

// TODO: change to green theme
export const darkThirdwebTheme = darkTheme({
  colors: {
    accentButtonText: "#1E293B",
    accentButtonBg: "#F8FAFC",
    accentText: "#F8FAFC",
    separatorLine: "#1E293B",
    modalBg: "#020817",
    // dropdownBg: "#020817",
    danger: "#e54d2e",
    borderColor: "#1E293B",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    primaryButtonBg: "#F8FAFC",
    primaryButtonText: "#0F172A",
    secondaryButtonBg: "#1E293B",
    secondaryButtonHoverBg: "#1E293B",
    secondaryButtonText: "#F8FAFC",
    walletSelectorButtonHoverBg:
      "#1e293b",
    connectedButtonBg: "#020817",
    connectedButtonBgHover: "#1E293B",
    skeletonBg: "#1E293B",
    selectedTextColor: "#131418",
  },
})

export const lightThirdwebTheme = lightTheme({
  colors: {
    accentText: "#0F172A",
    accentButtonBg: "#0F172A",
    accentButtonText: "#F1F5F9",
    modalBg: "#FFFFFF",
    // dropdownBg: "#FFFFFF",
    borderColor: "#E2E8F0",
    separatorLine: "#E2E8F0",
    secondaryButtonBg: "#F1F5F9",
    secondaryButtonHoverBg: "#F1F5F9",
    connectedButtonBgHover: "#F1F5F9",
    skeletonBg: "#F1F5F9",
    secondaryIconHoverBg: "#e9e8ea",
    primaryText: "#020817",
    secondaryText: "#64748B",
    primaryButtonBg: "#0F172A",
    primaryButtonText: "#F8FAFC",
    secondaryButtonText: "#0F172A",
    walletSelectorButtonHoverBg:
      "#F1F5F9",
    connectedButtonBg: "#FFFFFF",
    secondaryIconColor: "#706f78",
  },
})