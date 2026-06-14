CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" text DEFAULT 'investor' NOT NULL,
	"password_hash" text,
	"company" text,
	"country" text,
	"linkedin_url" text,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "investor_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"file_key" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text,
	"company_country" text NOT NULL,
	"sector" text NOT NULL,
	"activity_type" text NOT NULL,
	"investment_bracket" text NOT NULL,
	"target_regions" text[] DEFAULT '{}' NOT NULL,
	"jobs_to_create" integer,
	"preferred_legal_form" text,
	"current_step" text,
	"wizard_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investor_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "partner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"ice" text,
	"partner_type" text NOT NULL,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"description" text NOT NULL,
	"international_clients" text[],
	"website_url" text,
	"photo_key" text,
	"verified" boolean DEFAULT false NOT NULL,
	"avg_rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "expert_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"investor_id" uuid NOT NULL,
	"expert_id" uuid NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"meeting_url" text,
	"invoice_key" text,
	"confirmed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expert_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"photo_key" text,
	"specializations" text[] DEFAULT '{}' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"hourly_rate_mad" integer NOT NULL,
	"hourly_rate_eur" integer,
	"bio" text NOT NULL,
	"bio_fr" text,
	"bio_ar" text,
	"linkedin_url" text,
	"avg_rating" real DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expert_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "expert_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expert_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"booked" boolean DEFAULT false NOT NULL,
	"booked_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentive_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid,
	"sector" text NOT NULL,
	"region" text NOT NULL,
	"investment_bracket" text NOT NULL,
	"activity_type" text NOT NULL,
	"jobs_to_create" integer DEFAULT 0 NOT NULL,
	"applicable_incentives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_estimated_benefit" text,
	"report_key" text,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentive_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incentive_type" text NOT NULL,
	"label" text NOT NULL,
	"label_fr" text NOT NULL,
	"label_ar" text NOT NULL,
	"value" text NOT NULL,
	"condition" text NOT NULL,
	"source_article" text,
	"confidence" text DEFAULT 'indicative' NOT NULL,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"activity_types" text[] DEFAULT '{}' NOT NULL,
	"brackets" text[] DEFAULT '{}' NOT NULL,
	"min_jobs" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid,
	"user_id" text,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "introduction_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link_url" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cri_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region" text NOT NULL,
	"name_en" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_ar" text NOT NULL,
	"capital" text NOT NULL,
	"key_sectors" text[] DEFAULT '{}' NOT NULL,
	"industrial_zones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"land_price_range" text,
	"port_access" text,
	"talent_pool" text,
	"cri_contact_name" text,
	"cri_contact_email" text,
	"cri_contact_phone" text,
	"cri_website" text,
	"summary_en" text,
	"summary_fr" text,
	"summary_ar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cri_regions_region_unique" UNIQUE("region")
);
--> statement-breakpoint
CREATE TABLE "wizard_step_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"title_en" text NOT NULL,
	"title_fr" text NOT NULL,
	"title_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_ar" text NOT NULL,
	"applies_to_legal_forms" text[] DEFAULT '{}' NOT NULL,
	"applies_to_activities" text[] DEFAULT '{}' NOT NULL,
	"applies_to_sectors" text[] DEFAULT '{}' NOT NULL,
	"official_link" text,
	"estimated_days" integer,
	"required_documents" text[] DEFAULT '{}' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wizard_step_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "access_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"document_id" uuid,
	"action" text NOT NULL,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_documents" ADD CONSTRAINT "investor_documents_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_documents" ADD CONSTRAINT "investor_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_bookings" ADD CONSTRAINT "expert_bookings_slot_id_expert_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."expert_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_bookings" ADD CONSTRAINT "expert_bookings_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_bookings" ADD CONSTRAINT "expert_bookings_expert_id_expert_profiles_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."expert_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_profiles" ADD CONSTRAINT "expert_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_slots" ADD CONSTRAINT "expert_slots_expert_id_expert_profiles_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."expert_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_slots" ADD CONSTRAINT "expert_slots_booked_by_user_id_users_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incentive_results" ADD CONSTRAINT "incentive_results_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_investor_id_investor_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_partner_id_partner_profiles_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_audit_logs" ADD CONSTRAINT "access_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;