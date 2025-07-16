import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Conditions Générales de Vente",
};

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full bg-transparent font-body">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au menu
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-900">Conditions Générales de Vente</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="mb-4 text-base text-amber-900">Bienvenue sur ElBasta. En utilisant notre service, vous acceptez les conditions suivantes :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-amber-800">
            <li><strong>Commandes :</strong> Toute commande passée via notre site doit être confirmée par WhatsApp.</li>
            <li><strong>Prix :</strong> Les prix peuvent varier et inclure des frais de livraison selon la localisation.</li>
            <li><strong>Livraison :</strong> Nous faisons de notre mieux pour livrer dans les délais estimés, mais ceux-ci ne sont pas garantis.</li>
            <li><strong>Paiement :</strong> Le paiement est effectué à la livraison en espèces.</li>
            <li><strong>Retours :</strong> Aucun retour accepté sauf en cas de problème prouvé avec la commande.</li>
          </ul>
          <p className="text-amber-900">Merci de faire confiance à ElBasta.</p>
        </div>
      </div>
    </div>
  );
} 