import { PetCategoryPage } from "@/components/product/PetCategoryPage";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cat Products" };

export default function CatsPage() {
  return <PetCategoryPage petType="cat" title="Cat Products" />;
}
