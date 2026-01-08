export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          © Vayura, 2026
        </p>
        <div className="flex gap-6">
          <a href="/terms" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
            Terms
          </a>
          <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

