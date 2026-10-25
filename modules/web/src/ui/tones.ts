// Everyone's colour as a `--tone` variable (protocol `viewerColors`), for any styled part to read:
// `variants: { tone: viewerTones }`, then `color: 'var(--tone)'`.
export const viewerTones = {
  teal: { '--tone': '{colors.viewer.teal}' },
  sky: { '--tone': '{colors.viewer.sky}' },
  coral: { '--tone': '{colors.viewer.coral}' },
  violet: { '--tone': '{colors.viewer.violet}' },
  pink: { '--tone': '{colors.viewer.pink}' },
  lime: { '--tone': '{colors.viewer.lime}' },
  orange: { '--tone': '{colors.viewer.orange}' },
  silver: { '--tone': '{colors.viewer.silver}' },
} as const;
