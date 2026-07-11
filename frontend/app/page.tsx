import { CsvImporter } from "../components/importer/csv-importer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hero-radial px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CsvImporter />
      </div>
    </main>
  );
}
