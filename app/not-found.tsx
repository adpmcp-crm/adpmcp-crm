import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">A página que você está procurando não existe ou foi movida.</p>
        <Link
          href="/"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
