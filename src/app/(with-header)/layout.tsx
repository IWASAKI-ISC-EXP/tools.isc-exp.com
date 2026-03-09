import { NuqsAdapter } from "nuqs/adapters/react";
import type { PropsWithChildren } from "react";
import { CenteredLayout } from "@/components/centered-layout";
import { Header } from "@/features/header/components/header";

export default function ({ children }: PropsWithChildren) {
  return (
    <div>
      <Header />
      <CenteredLayout>
        <div className="py-6">
          <NuqsAdapter>{children}</NuqsAdapter>
        </div>
      </CenteredLayout>
    </div>
  );
}
