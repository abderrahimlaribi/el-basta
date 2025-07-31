import { BreadcrumbJsonLd } from '@/components/json-ld';

export default function SuiviStructuredData() {
  return (
    <BreadcrumbJsonLd 
      items={[
        { name: 'Accueil', url: 'https://elbasta.store/' },
        { name: 'Suivi de Commande', url: 'https://elbasta.store/suivi' }
      ]} 
    />
  );
}