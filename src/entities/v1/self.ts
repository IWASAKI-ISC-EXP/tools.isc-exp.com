import { AuthSelf } from "@/entities/self"; // 変更箇所: v1/self.ts として分離
import v from "@/entities/valibot";
import { User } from "./user";

export const Self = v.object({
  ...AuthSelf.entries,
  ...User.entries,
});
export type Self = v.InferOutput<typeof Self>;
