import { PagePlaceholder } from "@/components/page-placeholder";

export default function NotFound() {
  return (
    <PagePlaceholder
      phase="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
    />
  );
}
