import { PetCategoryPage } from "@/components/product/PetCategoryPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dog Products" };

export default function DogsPage() {
  return <PetCategoryPage petType="dog" title="Dog Products" />;
}
