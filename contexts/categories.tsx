"use client";

import { useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useContext } from "react";

import { Category } from "@/actions/category/type";
import { getCategories } from "@/actions/category/getCategories";
import { Option } from '@/components/ui/multiple-selector';

interface ICategoryContext {
  categories: Category[] | undefined,
  isCategoriesPending: boolean,
  categoryOptions: Option[]
}

const CategoryContext = createContext<ICategoryContext>({
  categories: [],
  isCategoriesPending: false,
  categoryOptions: []
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const { data: categories, isPending: isCategoriesPending } = useQuery({
    queryKey: ['fetchAllCategories'],
    queryFn: async () => await getCategories(),
  })

  // Transform categories into options
  const categoryOptions: Option[] = categories?.map(category => ({
    value: String(category.id),
    label: category.name,
  })) || [];

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isCategoriesPending,
        categoryOptions
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

/**
 * Provide access to all existing categories
 * @example const { categories } = useCategoryContext()
 * @returns categories data
 */

export const useCategoryContext = () => useContext(CategoryContext);