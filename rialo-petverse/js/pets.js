/* Rialo Petverse — inline SVG pet illustrations.
   Self-contained (no external image files), used by:
     - the sidebar carousel (changes every 4s)
     - the profile avatar picker
   Flat, rounded style to match the brand's rounded-blob logo language. */

const PET_LIBRARY = [
  {
    id: "dog",
    label: { en: "Dog", tr: "Köpek" },
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="115" r="70" fill="#D9A441"/>
      <ellipse cx="55" cy="70" rx="22" ry="34" fill="#C9694A" transform="rotate(-20 55 70)"/>
      <ellipse cx="145" cy="70" rx="22" ry="34" fill="#C9694A" transform="rotate(20 145 70)"/>
      <ellipse cx="100" cy="125" rx="46" ry="38" fill="#F3E7CF"/>
      <circle cx="78" cy="105" r="8" fill="#17171A"/>
      <circle cx="122" cy="105" r="8" fill="#17171A"/>
      <ellipse cx="100" cy="128" rx="10" ry="7" fill="#17171A"/>
      <path d="M85,140 Q100,152 115,140" stroke="#17171A" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "cat",
    label: { en: "Cat", tr: "Kedi" },
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="118" r="68" fill="#7C9473"/>
      <path d="M55,70 L40,30 L80,58 Z" fill="#7C9473"/>
      <path d="M145,70 L160,30 L120,58 Z" fill="#7C9473"/>
      <ellipse cx="100" cy="128" rx="44" ry="36" fill="#F3E7CF"/>
      <ellipse cx="80" cy="108" rx="7" ry="10" fill="#17171A"/>
      <ellipse cx="120" cy="108" rx="7" ry="10" fill="#17171A"/>
      <path d="M100,122 L94,132 L106,132 Z" fill="#17171A"/>
      <path d="M60,130 Q80,138 94,133" stroke="#17171A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M140,130 Q120,138 106,133" stroke="#17171A" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "rabbit",
    label: { en: "Rabbit", tr: "Tavşan" },
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="75" cy="55" rx="16" ry="46" fill="#E7DCC8" transform="rotate(-8 75 55)"/>
      <ellipse cx="125" cy="55" rx="16" ry="46" fill="#E7DCC8" transform="rotate(8 125 55)"/>
      <ellipse cx="75" cy="55" rx="8" ry="34" fill="#C9694A" transform="rotate(-8 75 55)"/>
      <ellipse cx="125" cy="55" rx="8" ry="34" fill="#C9694A" transform="rotate(8 125 55)"/>
      <circle cx="100" cy="128" r="62" fill="#F3E7CF"/>
      <circle cx="80" cy="118" r="7" fill="#17171A"/>
      <circle cx="120" cy="118" r="7" fill="#17171A"/>
      <ellipse cx="100" cy="132" rx="6" ry="5" fill="#D9A441"/>
      <path d="M88,140 Q100,148 112,140" stroke="#17171A" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "bird",
    label: { en: "Parrot", tr: "Papağan" },
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="120" rx="50" ry="60" fill="#6E85A0"/>
      <path d="M60,80 Q30,100 55,140 Q75,120 80,95 Z" fill="#7C9473"/>
      <circle cx="100" cy="75" r="34" fill="#D9A441"/>
      <path d="M128,78 L152,85 L128,92 Z" fill="#C9694A"/>
      <circle cx="92" cy="70" r="6" fill="#17171A"/>
      <path d="M85,50 Q100,35 115,50" stroke="#C9694A" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "hamster",
    label: { en: "Hamster", tr: "Hamster" },
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="115" r="68" fill="#E7DCC8"/>
      <circle cx="52" cy="62" r="20" fill="#E7DCC8"/>
      <circle cx="148" cy="62" r="20" fill="#E7DCC8"/>
      <circle cx="52" cy="62" r="10" fill="#C9694A"/>
      <circle cx="148" cy="62" r="10" fill="#C9694A"/>
      <circle cx="78" cy="112" r="7" fill="#17171A"/>
      <circle cx="122" cy="112" r="7" fill="#17171A"/>
      <ellipse cx="100" cy="130" rx="8" ry="6" fill="#D9A441"/>
      <ellipse cx="65" cy="140" rx="16" ry="12" fill="#F6F0E4"/>
      <ellipse cx="135" cy="140" rx="16" ry="12" fill="#F6F0E4"/>
    </svg>`
  }
];
