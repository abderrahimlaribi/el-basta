import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';

export default function HomeStructuredData() {
  return (
    <>
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd 
        items={[
          { name: 'Accueil', url: 'https://elbasta.store/' }
        ]} 
      />
    </>
  );
}