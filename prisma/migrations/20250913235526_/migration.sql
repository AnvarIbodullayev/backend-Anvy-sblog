-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "image" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
