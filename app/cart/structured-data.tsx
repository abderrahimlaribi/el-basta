import { BreadcrumbJsonLd } from '@/components/json-ld';

export default function CartStructuredData() {
  return (
    <BreadcrumbJsonLd 
      items={[
        { name: 'Accueil', url: 'https://elbasta.store/' },
        { name: 'Panier', url: 'https://elbasta.store/cart' }
      ]} 
    />
  );
}