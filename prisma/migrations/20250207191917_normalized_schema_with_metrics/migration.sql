-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('super_admin', 'company_admin');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'suspended', 'locked', 'pending_activation');

-- CreateEnum
CREATE TYPE "company_status" AS ENUM ('active', 'inactive', 'suspended', 'pending_setup');

-- CreateEnum
CREATE TYPE "company_type" AS ENUM ('enterprise', 'small_business', 'startup');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'password_change', 'password_reset', 'settings_change', 'login_failed', 'invitation_sent', 'invitation_resent', 'invitation_cancelled', 'invitation_accepted', 'invitation_expired');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('email', 'in_app', 'both', 'none');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('unread', 'read', 'archived');

-- CreateEnum
CREATE TYPE "notification_priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "metric_type" AS ENUM ('cpu', 'memory', 'disk', 'network', 'api', 'custom');

-- CreateEnum
CREATE TYPE "health_status" AS ENUM ('healthy', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "api_method" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "website" TEXT,
    "type" "company_type" NOT NULL DEFAULT 'small_business',
    "status" "company_status" NOT NULL DEFAULT 'pending_setup',
    "industry" TEXT,
    "employee_count" INTEGER,
    "tax_id" TEXT,
    "registration_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "setup_completed_at" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3),
    "health_check_enabled" BOOLEAN NOT NULL DEFAULT true,
    "health_check_interval" INTEGER NOT NULL DEFAULT 300,
    "max_resource_quota" JSONB,
    "last_health_check" TIMESTAMP(3),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_address" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_contact" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "contact_info_id" INTEGER NOT NULL,
    "department" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smtp_config" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "encryption_type" TEXT NOT NULL DEFAULT 'TLS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smtp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_config" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "password_history_limit" INTEGER NOT NULL DEFAULT 3,
    "password_expiry_days" INTEGER NOT NULL DEFAULT 90,
    "max_failed_attempts" INTEGER NOT NULL DEFAULT 5,
    "session_timeout_mins" INTEGER NOT NULL DEFAULT 60,
    "enforce_single_session" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_config" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "notification_type" "notification_type" NOT NULL DEFAULT 'email',
    "reminder_days" INTEGER[] DEFAULT ARRAY[3, 7]::INTEGER[],
    "alert_thresholds" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'company_admin',
    "status" "user_status" NOT NULL DEFAULT 'pending_activation',
    "company_id" INTEGER NOT NULL,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_attempt" TIMESTAMP(3),
    "last_password_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_verified" TIMESTAMP(3),
    "invitation_accepted_at" TIMESTAMP(3),
    "invitation_token" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_address" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_contact" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_info_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_metrics" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" "api_method" NOT NULL,
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "user_id" INTEGER,
    "company_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_body" JSONB,
    "response_size" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "metric_type" "metric_type" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "company_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_health" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "status" "health_status" NOT NULL DEFAULT 'healthy',
    "error_rate" DOUBLE PRECISION NOT NULL,
    "avg_response_time" DOUBLE PRECISION NOT NULL,
    "uptime_percentage" DOUBLE PRECISION NOT NULL,
    "active_users" INTEGER NOT NULL,
    "resource_usage" JSONB NOT NULL,
    "critical_issues" INTEGER NOT NULL,
    "last_check" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_hourly" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "avg_value" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_daily" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "avg_value" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_monthly" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "avg_value" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_monthly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_invitation" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'company_admin',
    "token" TEXT NOT NULL,
    "status" "invitation_status" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_by_id" INTEGER NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by_id" INTEGER,
    "cancelled_by_name" TEXT,
    "previous_tokens" TEXT[],
    "reminder_sent_at" TIMESTAMP(3),
    "reminder_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "company_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "action" "audit_action" NOT NULL,
    "details" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'unread',
    "priority" "notification_priority" NOT NULL DEFAULT 'low',
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "address_uuid_key" ON "address"("uuid");

-- CreateIndex
CREATE INDEX "address_country_state_city_idx" ON "address"("country", "state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_uuid_key" ON "contact_info"("uuid");

-- CreateIndex
CREATE INDEX "contact_info_type_value_idx" ON "contact_info"("type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "company_uuid_key" ON "company"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "company_identifier_key" ON "company"("identifier");

-- CreateIndex
CREATE INDEX "company_identifier_idx" ON "company"("identifier");

-- CreateIndex
CREATE INDEX "company_status_idx" ON "company"("status");

-- CreateIndex
CREATE UNIQUE INDEX "company_address_company_id_type_is_primary_key" ON "company_address"("company_id", "type", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "company_contact_company_id_contact_info_id_key" ON "company_contact"("company_id", "contact_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "smtp_config_uuid_key" ON "smtp_config"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "smtp_config_company_id_key" ON "smtp_config"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "security_config_uuid_key" ON "security_config"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "security_config_company_id_key" ON "security_config"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_config_uuid_key" ON "notification_config"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "notification_config_company_id_key" ON "notification_config"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_uuid_key" ON "user"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_company_id_email_idx" ON "user"("company_id", "email");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_address_user_id_type_is_primary_key" ON "user_address"("user_id", "type", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_user_id_contact_info_id_key" ON "user_contact"("user_id", "contact_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_metrics_uuid_key" ON "api_metrics"("uuid");

-- CreateIndex
CREATE INDEX "api_metrics_endpoint_idx" ON "api_metrics"("endpoint");

-- CreateIndex
CREATE INDEX "api_metrics_created_at_idx" ON "api_metrics"("created_at");

-- CreateIndex
CREATE INDEX "api_metrics_company_id_idx" ON "api_metrics"("company_id");

-- CreateIndex
CREATE INDEX "api_metrics_status_code_idx" ON "api_metrics"("status_code");

-- CreateIndex
CREATE UNIQUE INDEX "system_metrics_uuid_key" ON "system_metrics"("uuid");

-- CreateIndex
CREATE INDEX "system_metrics_metric_type_created_at_idx" ON "system_metrics"("metric_type", "created_at");

-- CreateIndex
CREATE INDEX "system_metrics_company_id_idx" ON "system_metrics"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_health_uuid_key" ON "company_health"("uuid");

-- CreateIndex
CREATE INDEX "company_health_company_id_idx" ON "company_health"("company_id");

-- CreateIndex
CREATE INDEX "company_health_created_at_idx" ON "company_health"("created_at");

-- CreateIndex
CREATE INDEX "metrics_hourly_hour_idx" ON "metrics_hourly"("hour");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_hourly_company_id_metric_type_hour_key" ON "metrics_hourly"("company_id", "metric_type", "hour");

-- CreateIndex
CREATE INDEX "metrics_daily_date_idx" ON "metrics_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_daily_company_id_metric_type_date_key" ON "metrics_daily"("company_id", "metric_type", "date");

-- CreateIndex
CREATE INDEX "metrics_monthly_month_idx" ON "metrics_monthly"("month");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_monthly_company_id_metric_type_month_key" ON "metrics_monthly"("company_id", "metric_type", "month");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitation_uuid_key" ON "company_invitation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitation_token_key" ON "company_invitation"("token");

-- CreateIndex
CREATE INDEX "company_invitation_token_idx" ON "company_invitation"("token");

-- CreateIndex
CREATE INDEX "company_invitation_status_idx" ON "company_invitation"("status");

-- CreateIndex
CREATE INDEX "company_invitation_expires_at_idx" ON "company_invitation"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitation_company_id_email_key" ON "company_invitation"("company_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "password_history_uuid_key" ON "password_history"("uuid");

-- CreateIndex
CREATE INDEX "password_history_user_id_created_at_idx" ON "password_history"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "audit_log_uuid_key" ON "audit_log"("uuid");

-- CreateIndex
CREATE INDEX "audit_log_company_id_created_at_idx" ON "audit_log"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_user_id_created_at_idx" ON "audit_log"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_uuid_key" ON "notification"("uuid");

-- CreateIndex
CREATE INDEX "notification_user_id_status_idx" ON "notification"("user_id", "status");

-- CreateIndex
CREATE INDEX "notification_company_id_created_at_idx" ON "notification"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "account_uuid_key" ON "account"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provider_account_id_key" ON "account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_uuid_key" ON "session"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- AddForeignKey
ALTER TABLE "company_address" ADD CONSTRAINT "company_address_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_address" ADD CONSTRAINT "company_address_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contact" ADD CONSTRAINT "company_contact_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contact" ADD CONSTRAINT "company_contact_contact_info_id_fkey" FOREIGN KEY ("contact_info_id") REFERENCES "contact_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smtp_config" ADD CONSTRAINT "smtp_config_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_config" ADD CONSTRAINT "security_config_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_config" ADD CONSTRAINT "notification_config_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contact" ADD CONSTRAINT "user_contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contact" ADD CONSTRAINT "user_contact_contact_info_id_fkey" FOREIGN KEY ("contact_info_id") REFERENCES "contact_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_metrics" ADD CONSTRAINT "api_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_metrics" ADD CONSTRAINT "system_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_health" ADD CONSTRAINT "company_health_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_hourly" ADD CONSTRAINT "metrics_hourly_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_daily" ADD CONSTRAINT "metrics_daily_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_monthly" ADD CONSTRAINT "metrics_monthly_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitation" ADD CONSTRAINT "company_invitation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
