import { useApp } from '../context/AppContext.tsx';

export function WhatsAppFab() {
  const { settings } = useApp();

  const configuredWaNumber = settings?.social?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
  const defaultMessage =
    'Bonjour UNITRACA, je souhaite obtenir des renseignements auprès du service client concernant vos enseignements et activités.';

  const whatsappUrl = configuredWaNumber
    ? `https://wa.me/${configuredWaNumber}?text=${encodeURIComponent(defaultMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center pointer-events-none">
      <div className="group relative flex items-center pointer-events-auto">
        {/* Tooltip displaying 'Service client' on hover */}
        <span
          id="whatsapp-fab-tooltip"
          role="tooltip"
          className="mr-3 px-4 py-2 rounded-xl bg-[var(--color-earth-dark)] text-[var(--color-ivory)] text-xs font-semibold tracking-wide whitespace-nowrap shadow-xl border border-[var(--color-brass)]/40 opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-200"
        >
          Service client
        </span>

        {/* Persistent Floating Action Button opening a new WhatsApp conversation window */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Service client — Ouvrir une conversation WhatsApp"
          aria-describedby="whatsapp-fab-tooltip"
          className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 focus:scale-105 border-2 border-white/90"
        >
          {/* Subtle attention ring */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping pointer-events-none"
            style={{ animationDuration: '3s' }}
          />

          {/* Official WhatsApp SVG Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="w-7 h-7 relative z-10"
          >
            <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.758.459 3.474 1.331 4.988L2 22l5.169-1.356a9.927 9.927 0 0 0 4.862 1.262h.004c5.515 0 9.969-4.453 9.969-9.968A9.938 9.938 0 0 0 19.084 4.92 9.934 9.934 0 0 0 12.031 2Zm0 18.235h-.003a8.26 8.26 0 0 1-4.212-1.153l-.302-.179-3.137.823.837-3.058-.197-.313a8.252 8.252 0 0 1-1.273-4.386c0-4.557 3.708-8.265 8.269-8.265 2.208 0 4.284.861 5.844 2.423a8.213 8.213 0 0 1 2.421 5.843c0 4.558-3.708 8.265-8.247 8.265Zm4.534-6.188c-.248-.124-1.469-.725-1.696-.808-.228-.083-.393-.124-.559.124-.165.249-.641.808-.786.973-.145.166-.289.187-.537.062-.248-.124-1.048-.386-1.996-1.232-.738-.658-1.236-1.471-1.381-1.72-.145-.248-.015-.382.109-.506.112-.111.248-.29.372-.435.124-.145.165-.248.248-.414.083-.166.041-.31-.021-.435-.062-.124-.558-1.346-.765-1.843-.201-.483-.406-.418-.558-.426l-.476-.008c-.165 0-.434.062-.661.31-.228.249-.869.849-.869 2.071s.889 2.402 1.013 2.568c.124.166 1.749 2.671 4.238 3.745.592.256 1.054.409 1.415.523.595.189 1.136.162 1.564.098.477-.071 1.468-.6 1.675-1.18.207-.58.207-1.077.145-1.18-.062-.104-.228-.166-.476-.29Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
