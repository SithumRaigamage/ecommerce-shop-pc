import {
  Armchair,
  Box,
  CircuitBoard,
  Cpu,
  Dices,
  Fan,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  MemoryStick,
  Monitor,
  Network,
  Package,
  Plug,
  Usb,
  Video,
  type LucideIcon,
} from 'lucide-react'

/**
 * The JSON fixtures still ship Font Awesome class names ("fas fa-laptop").
 * Rather than rewrite the data, map those to their lucide equivalents so the
 * Font Awesome stylesheet dependency could be dropped.
 */
const FA_TO_LUCIDE: Record<string, LucideIcon> = {
  'fa-armchair': Armchair,
  'fa-box': Box,
  'fa-chair': Armchair,
  'fa-desktop': Monitor,
  'fa-dice': Dices,
  'fa-fan': Fan,
  'fa-gamepad': Gamepad2,
  'fa-hdd': HardDrive,
  'fa-headphones': Headphones,
  'fa-keyboard': Keyboard,
  'fa-laptop': Laptop,
  'fa-memory': MemoryStick,
  'fa-microchip': Cpu,
  'fa-network-wired': Network,
  'fa-plug': Plug,
  'fa-server': CircuitBoard,
  'fa-usb': Usb,
  'fa-video': Video,
}

export function iconFromFaClass(faClass: string | undefined): LucideIcon {
  if (!faClass) return Package
  for (const token of faClass.split(/\s+/)) {
    const icon = FA_TO_LUCIDE[token]
    if (icon) return icon
  }
  return Package
}
