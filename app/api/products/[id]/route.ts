import { NextResponse } from "next/server";
import { deleteStoreProduct, updateStoreProduct } from "@/lib/product-service";
import type { ProductCategory } from "@/types/product";
import { requireAdminApi } from "@/lib/auth-helpers";

const categories: ProductCategory[] = ["jewellery", "watches"];

type ProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function readString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function readStringList(value: unknown, field: string) {
  if (Array.isArray(value)) {
    return value.map((item) => readString(item, field)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function readNumber(value: unknown, field: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${field} must be a positive number.`);
  }

  return Math.round(number);
}

export async function PUT(request: Request, { params }: ProductRouteProps) {

  const authorization = await requireAdminApi();

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        message:
          authorization.status === 401
            ? "Authentication is required."
            : "Administrator access is required."
      },
      { status: authorization.status }
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const category = body.category;

    if (!categories.includes(category as ProductCategory)) {
      throw new Error("Category must be jewellery or watches.");
    }

    const product = await updateStoreProduct(id, {
      name: readString(body.name, "Name"),
      category: category as ProductCategory,
      collection: readString(body.collection, "Collection"),
      price: readNumber(body.price, "Price"),
      image: readString(body.image, "Main image"),
      gallery: readStringList(body.gallery, "Gallery"),
      description: readString(body.description, "Description"),
      details: readStringList(body.details, "Details"),
      material: readString(body.material, "Material"),
      stock: readNumber(body.stock, "Stock"),
      featured: Boolean(body.featured)
    });

    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product could not be updated.";
    const status = message === "Product not found." ? 404 : 400;

    return NextResponse.json({ message }, { status });
  }
}
export async function DELETE(_request: Request, { params }: ProductRouteProps) {

  const authorization = await requireAdminApi();

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        message:
          authorization.status === 401
            ? "Authentication is required."
            : "Administrator access is required."
      },
      { status: authorization.status }
    );
  }

  try {
    const { id } = await params;

    await deleteStoreProduct(id);

    return NextResponse.json({
      message: "Product deleted successfully."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product could not be deleted.";
    const status = message === "Product not found." ? 404 : 400;

    return NextResponse.json({ message }, { status });
  }
}