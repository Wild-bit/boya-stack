-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "i18n_project_schema";

-- CreateEnum
CREATE TYPE "i18n_project_schema"."TeamRole" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- CreateEnum
CREATE TYPE "i18n_project_schema"."InviteStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "i18n_project_schema"."ProjectRole" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- CreateTable
CREATE TABLE "i18n_project_schema"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "feishu_id" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."team_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" "i18n_project_schema"."TeamRole" NOT NULL DEFAULT 'READER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "description" TEXT,
    "source_locale" TEXT NOT NULL DEFAULT 'zh-CN',
    "target_languages" TEXT[] DEFAULT ARRAY['en', 'zh-CN']::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."project_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "role" "i18n_project_schema"."ProjectRole" NOT NULL DEFAULT 'READER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."i18n_keys" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "sourceText" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i18n_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."i18n_translations" (
    "id" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i18n_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."invite_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "i18n_project_schema"."TeamRole" NOT NULL DEFAULT 'READER',
    "status" "i18n_project_schema"."InviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "team_id" TEXT NOT NULL,
    "invite_by" TEXT NOT NULL,
    "acceptedBy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n_project_schema"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "i18n_project_schema"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "i18n_project_schema"."users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_feishu_id_key" ON "i18n_project_schema"."users"("feishu_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "i18n_project_schema"."teams"("slug");

-- CreateIndex
CREATE INDEX "teams_owner_id_idx" ON "i18n_project_schema"."teams"("owner_id");

-- CreateIndex
CREATE INDEX "team_members_team_id_idx" ON "i18n_project_schema"."team_members"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "i18n_project_schema"."team_members"("user_id", "team_id");

-- CreateIndex
CREATE INDEX "projects_team_id_idx" ON "i18n_project_schema"."projects"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_team_id_slug_key" ON "i18n_project_schema"."projects"("team_id", "slug");

-- CreateIndex
CREATE INDEX "project_members_project_id_idx" ON "i18n_project_schema"."project_members"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_user_id_project_id_key" ON "i18n_project_schema"."project_members"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "i18n_keys_project_id_idx" ON "i18n_project_schema"."i18n_keys"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "i18n_keys_project_id_namespace_key_key" ON "i18n_project_schema"."i18n_keys"("project_id", "namespace", "key");

-- CreateIndex
CREATE INDEX "i18n_translations_key_id_idx" ON "i18n_project_schema"."i18n_translations"("key_id");

-- CreateIndex
CREATE UNIQUE INDEX "i18n_translations_key_id_lang_key" ON "i18n_project_schema"."i18n_translations"("key_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_token_key" ON "i18n_project_schema"."invite_links"("token");

-- CreateIndex
CREATE INDEX "invite_links_token_idx" ON "i18n_project_schema"."invite_links"("token");

-- CreateIndex
CREATE INDEX "invite_links_team_id_idx" ON "i18n_project_schema"."invite_links"("team_id");

-- CreateIndex
CREATE INDEX "invite_links_invite_by_idx" ON "i18n_project_schema"."invite_links"("invite_by");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "i18n_project_schema"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "i18n_project_schema"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "i18n_project_schema"."refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "i18n_project_schema"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "i18n_project_schema"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "i18n_project_schema"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."projects" ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "i18n_project_schema"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "i18n_project_schema"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "i18n_project_schema"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."i18n_keys" ADD CONSTRAINT "i18n_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "i18n_project_schema"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."i18n_translations" ADD CONSTRAINT "i18n_translations_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "i18n_project_schema"."i18n_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."invite_links" ADD CONSTRAINT "invite_links_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "i18n_project_schema"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."invite_links" ADD CONSTRAINT "invite_links_invite_by_fkey" FOREIGN KEY ("invite_by") REFERENCES "i18n_project_schema"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."invite_links" ADD CONSTRAINT "invite_links_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "i18n_project_schema"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i18n_project_schema"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "i18n_project_schema"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
