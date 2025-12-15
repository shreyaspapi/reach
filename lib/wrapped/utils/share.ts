import type { WrappedData } from "@/types/onchain-wrapped"
import html2canvas from "html2canvas"

/**
 * Converts oklch() CSS color values to hex colors that html2canvas can parse
 */
function convertOklchToHex(colorValue: string): string {
  const colorMap: Record<string, string> = {
    "oklch(1 0 0)": "#ffffff",
    "oklch(0.145 0 0)": "#252525",
    "oklch(0.985 0 0)": "#fafafa",
    "oklch(0.205 0 0)": "#343434",
    "oklch(0.97 0 0)": "#f7f7f7",
    "oklch(0.556 0 0)": "#8e8e8e",
    "oklch(0.922 0 0)": "#ebebeb",
    "oklch(0.708 0 0)": "#b5b5b5",
    "oklch(0.269 0 0)": "#454545",
    "oklch(0.439 0 0)": "#707070",
  }

  const normalized = colorValue.trim()
  if (colorMap[normalized]) {
    return colorMap[normalized]
  }

  if (normalized.startsWith("oklch")) {
    const match = normalized.match(/oklch\(([\d.]+)\s+[\d.]+\s+[\d.]+\)/)
    if (match) {
      const lightness = Number.parseFloat(match[1])
      const value = Math.round(lightness * 255)
      const hex = `#${value.toString(16).padStart(2, "0").repeat(3)}`
      return hex
    }
  }

  return colorValue
}

/**
 * Recursively converts all oklch() colors in an element and its children to hex
 */
function convertColorsInElement(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element)

  const propertiesToConvert = [
    "backgroundColor",
    "color",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "fill",
    "stroke",
  ]

  propertiesToConvert.forEach((prop) => {
    const value = computedStyle[prop as any]
    if (value && value.includes("oklch")) {
      const converted = convertOklchToHex(value)
      ;(element.style as any)[prop] = converted
    }
  })

  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement || child instanceof SVGElement) {
      convertColorsInElement(child as HTMLElement)
    }
  })
}

/**
 * Converts the wrapped card DOM element into a high-quality image
 */
export async function generateWrappedCardImage(cardElement: HTMLElement, format: "jpg" | "png" = "jpg"): Promise<Blob> {
  const clone = cardElement.cloneNode(true) as HTMLElement
  clone.style.position = "fixed"
  clone.style.left = "-9999px"
  clone.style.top = "0"
  clone.style.width = cardElement.offsetWidth + "px"
  clone.style.height = cardElement.offsetHeight + "px"

  document.body.appendChild(clone)

  try {
    convertColorsInElement(clone)

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#f9f8f4",
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 10000,
    })

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to generate image blob"))
          }
        },
        format === "png" ? "image/png" : "image/jpeg",
        format === "jpg" ? 0.95 : undefined,
      )
    })
  } finally {
    document.body.removeChild(clone)
  }
}

/**
 * Downloads the wrapped card as a high-quality image
 */
export async function downloadWrappedCard(address?: string, format: "jpg" | "png" = "jpg") {
  try {
    const cardElement = document.querySelector("[data-wrapped-card]") as HTMLElement
    if (!cardElement) {
      throw new Error("Wrapped card element not found. Please refresh the page and try again.")
    }

    const blob = await generateWrappedCardImage(cardElement, format)

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `luno-wrapped-2025-${address?.slice(0, 8) || "card"}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading card:", error)
    throw new Error("Failed to download card. Please try again.")
  }
}

/**
 * Generates a shareable deep link for the wrapped card
 */
export function generateDeepLink(address: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  return `${baseUrl}/wrapped?address=${address}`
}

/**
 * Shares the wrapped card to Twitter/X with image
 */
export async function shareToTwitter(data: WrappedData, address?: string) {
  const shareText =
    `Just got my Luno Wrapped for 2025! 🎯\n\n` +
    `📊 Score: ${data.summary?.chainScore || 0}/100\n` +
    `💰 ${data.transactions?.totalTransactions || 0} transactions\n` +
    `🔥 ${data.summary?.totalDaysActive || 0} active days\n\n` +
    `Get yours too 👇\n` +
    `${generateDeepLink(address || data.walletAddress)}`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  window.open(twitterUrl, "_blank", "width=550,height=420")
}

/**
 * Shares the wrapped card to Farcaster with image
 */
export async function shareToFarcaster(data: WrappedData, address?: string) {
  const shareText =
    `Just got my Luno Wrapped for 2025! 🎯\n\n` +
    `Score: ${data.summary?.chainScore || 0}/100 | ` +
    `${data.transactions?.totalTransactions || 0} txs | ` +
    `${data.summary?.totalDaysActive || 0} active days\n\n` +
    `Get yours: ${generateDeepLink(address || data.walletAddress)}`

  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`
  window.open(warpcastUrl, "_blank", "width=550,height=600")
}

/**
 * Shares the wrapped card to Base App
 */
export async function shareToBaseApp(data: WrappedData, address?: string) {
  const shareText =
    `My Luno Wrapped 2025 🎯\n\n` +
    `Chain Score: ${data.summary?.chainScore || 0}/100\n` +
    `${data.transactions?.totalTransactions || 0} transactions on Base\n\n` +
    `${generateDeepLink(address || data.walletAddress)}`

  const baseAppUrl = `https://base.org/share?text=${encodeURIComponent(shareText)}`
  window.open(baseAppUrl, "_blank")
}

/**
 * Copies the deep link to clipboard
 */
export async function copyDeepLink(address: string): Promise<boolean> {
  try {
    const deepLink = generateDeepLink(address)
    await navigator.clipboard.writeText(deepLink)
    return true
  } catch (error) {
    console.error("Error copying link:", error)
    return false
  }
}

