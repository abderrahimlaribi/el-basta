import { BreadcrumbJsonLd } from '@/components/json-ld';

export default function ConditionsStructuredData() {
  return (
    <BreadcrumbJsonLd 
      items={[
        { name: 'Accueil', url: 'https://elbasta.store/' },
        { name: 'Conditions Générales', url: 'https://elbasta.store/conditions' }
      ]} 
    />
  );
}