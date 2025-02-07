/*
  Warnings:

  - You are about to drop the column `request_body` on the `api_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `max_resource_quota` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `resource_usage` on the `company_health` table. All the data in the column will be lost.
  - You are about to drop the column `previous_tokens` on the `company_invitation` table. All the data in the column will be lost.
  - You are about to drop the column `alert_thresholds` on the `notification_config` table. All the data in the column will be lost.
  - You are about to drop the column `reminder_days` on the `notification_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_metrics" DROP COLUMN "request_body",
ADD COLUMN     "request_size" INTEGER;

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "company" DROP COLUMN "max_resource_quota";

-- AlterTable
ALTER TABLE "company_health" DROP COLUMN "resource_usage";

-- AlterTable
ALTER TABLE "company_invitation" DROP COLUMN "previous_tokens";

-- AlterTable
ALTER TABLE "notification_config" DROP COLUMN "alert_thresholds",
DROP COLUMN "reminder_days";

-- CreateTable
CREATE TABLE "reminder_schedule" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "days_before" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_threshold" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "metric_name" TEXT NOT NULL,
    "warning" DOUBLE PRECISION NOT NULL,
    "critical" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_threshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_quota" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "resource" TEXT NOT NULL,
    "limit" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_metadata" (
    "id" SERIAL NOT NULL,
    "audit_log_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reminder_schedule_company_id_days_before_key" ON "reminder_schedule"("company_id", "days_before");

-- CreateIndex
CREATE UNIQUE INDEX "alert_threshold_company_id_metric_name_key" ON "alert_threshold"("company_id", "metric_name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_quota_company_id_resource_key" ON "resource_quota"("company_id", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "audit_metadata_audit_log_id_key_key" ON "audit_metadata"("audit_log_id", "key");

-- AddForeignKey
ALTER TABLE "reminder_schedule" ADD CONSTRAINT "reminder_schedule_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_threshold" ADD CONSTRAINT "alert_threshold_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_quota" ADD CONSTRAINT "resource_quota_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
