import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/* Broken cart SVG illustration */}
      <div className="mb-8">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Cart body */}
          <path
            d="M20 30H35L45 75H95L105 40H42"
            stroke="#1B4332"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Broken handle - crack line */}
          <path
            d="M52 54L60 62L54 70"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 48L76 56L68 64"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wheels */}
          <circle
            cx="52"
            cy="88"
            r="6"
            stroke="#1B4332"
            strokeWidth="3"
          />
          <circle
            cx="88"
            cy="88"
            r="6"
            stroke="#1B4332"
            strokeWidth="3"
          />
          {/* Empty items - dashed lines suggesting missing products */}
          <line
            x1="50"
            y1="58"
            x2="65"
            y2="58"
            stroke="#1B4332"
            strokeWidth="2"
            strokeDasharray="3 3"
            opacity="0.3"
          />
          <line
            x1="50"
            y1="65"
            x2="60"
            y2="65"
            stroke="#1B4332"
            strokeWidth="2"
            strokeDasharray="3 3"
            opacity="0.3"
          />
          {/* Question mark */}
          <text
            x="78"
            y="68"
            fill="#1B4332"
            fontSize="18"
            fontWeight="bold"
            opacity="0.4"
          >
            ?
          </text>
        </svg>
      </div>

      {/* 404 number */}
      <h1 className="text-7xl font-extrabold tracking-tight text-[#1B4332]">
        404
      </h1>

      {/* Message */}
      <p className="mt-4 text-xl font-semibold text-gray-900">
        Oups ! Page introuvable
      </p>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>

      {/* Back home button */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#14532d]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
